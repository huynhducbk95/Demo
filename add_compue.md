
# Thêm 2 host compute11 và compute12 vào cluster tầng 6

## I. Port on switches

```bash
10.240.172.144 - ens0f1 - Test by asign an IP
*  150     48df.3720.6d41   dynamic  0         F      F    Eth1/1
*  150     48df.3720.7011   dynamic  0         F      F    Eth1/2

10.240.172.133 - ens0f0
*  193     48df.3720.6d40   dynamic  0         F      F    Eth1/13
*  193     48df.3720.7010   dynamic  0         F      F    Eth1/14
```

> Ngược với các compute host khác. Các host khác có ens0f1 trên SW 133
và ngược lại ens0f1 trên SW 144

- Vấn đề : SW 133 init các vlan nội bộ nhưng SW 144 thì chưa
- Xử lý và thay đổi:
  - Cấu hình vlan 193,194 cho port trên SW 133 của compute11 và compute12
  - Cấu hình trunk allow all cho port trên SW 144 của compute11 và compute12
  - Init tất cả VLAN đang có trên SW 133 cho SW 144


## II. Các bước thực hiện thêm 2 compute host
Các bước thực hiện trên 2 host tương tự nhau. Phần này thực hiện cài đặt và cấu hình trên host **compute12** với ip là `10.240.193.12`
### 1. Install OS 7
- Mount ổ đĩa với file .iso
- Thay đổi boot option đến ổ đĩa vừa được mount.
- Tiến hành cài đặt OS như bình thường.
### 2. Cấu hình cơ bản.
Sau khi cài đặt xong hệ điều hành, thực hiện các bước cài đặt cơ bản sau:
- Thay đổi hostname trong file `/etc/hostname`:
```
compute12
```
- Thêm thông tin các host trong file `/etc/hosts`:
```
127.0.0.1 localhost
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6

10.240.193.13 ceph-osd1
10.240.193.14 ceph-osd2
10.240.193.15 ceph-osd3

10.240.193.21 controller21
10.240.193.22 controller22
10.240.193.23 controller23 

10.240.193.11 compute11
10.240.193.12 compute12
10.240.193.16 compute16
10.240.193.17 compute17
10.240.193.18 compute18
10.240.193.19 compute19
10.240.193.20 compute20
```
Tương tự, thêm thông tin của compute12 vào `/etc/hosts` trên các host khác trong cluster.
### 2. Config network.
Tiếp theo, cấu hình các NIC trên **compute12** tương tự như các compute host khác.
- cd vào thư mục `/etc/sysconfig/network-scripts/`.
- Cấu hình NIC **ens3f0** bằng cách thay đổi file  `ifcfg-ens3f0` với nội dung như sau:
```
BOOTPROTO=none
NAME=ens3f0
DEVICE=ens3f0
ONBOOT=yes
NM_CONTROLLED=no
```
- Cấu hình VLAN 193 cho NIC **ens3f0** bằng cách thêm file `ifcfg-ens3f0.193` với nội dung như sau:
```
DEVICE=ens3f0.193
NAME=ens3f0.193
BOOTPROTO=none
ONPARENT=yes
VLAN=yes
NM_CONTROLLED=no
IPADDR=10.240.193.12
PREFIX=24
GATEWAY=10.240.193.1
```
- Tương tự, cấu hình VLAN 194 cho NIC **ens3f0** bằng cách thêm file `ifcfg-ens3f0.194` với nội dung như sau:
```
DEVICE=ens3f0.194
NAME=ens3f0.194
BOOTPROTO=none
ONPARENT=yes
VLAN=yes
NM_CONTROLLED=no
IPADDR=10.240.194.12
PREFIX=24
```
- Tiếp theo, tạo NIC ảo là **bond0** và thiết lập primary interface là **ens3f1**, thêm file `ifcfg-bond0` với nội dung như sau:
```
NAME=bond0
DEVICE=bond0
BONDING_MASTER=yes
TYPE=Bond
ONBOOT=yes
BOOTPROTO=none
BONDING_OPTS="mode=active-backup miimon=100 primary=ens3f1"
NM_CONTROLLED=no
```
Sau đó, thay đổi cấu hình của NIC **ens3f1** trong file `ifcfg-ens3f1` trong cùng thư mục với nội dung như sau:
```
TYPE=Ethernet
DEVICE=ens3f1
BOOTPROTO=none
ONBOOT=yes
MASTER=bond0
SLAVE=yes
NM_CONTROLLED=no
```
Cuối cùng, thực hiện **restart** network để các thay đổi được thực thi:
```
systemctl restart network
```
Kết quả cấu hình mạng:
```
# ip r
default via 10.240.193.1 dev ens3f0.193 
10.240.193.0/24 dev ens3f0.193 proto kernel scope link src 10.240.193.12 
10.240.194.0/24 dev ens3f0.194 proto kernel scope link src 10.240.194.12 
169.254.0.0/16 dev ens3f0 scope link metric 1008 
169.254.0.0/16 dev ens3f0.193 scope link metric 1013 
169.254.0.0/16 dev ens3f0.194 scope link metric 1014 
172.17.0.0/16 dev docker0 proto kernel scope link src 172.17.0.1
```
```
# ip a
...
10: ens3f1: <BROADCAST,MULTICAST,SLAVE,UP,LOWER_UP> mtu 1500 qdisc mq master bond0 state UP group default qlen 1000
    link/ether 48:df:37:20:6d:41 brd ff:ff:ff:ff:ff:ff
11: eno52: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc mq state DOWN group default qlen 1000
    link/ether 48:df:37:13:42:93 brd ff:ff:ff:ff:ff:ff
12: bond0: <BROADCAST,MULTICAST,MASTER,UP,LOWER_UP> mtu 1500 qdisc noqueue master ovs-system state UP group default qlen 1000
    link/ether 48:df:37:20:6d:41 brd ff:ff:ff:ff:ff:ff
...
```
### 3. Thiết lập local repo và cài đặt Docker.
- Truy cập vào một compute hkhác (ví dụ compute16 ), copy 2 file là `ceph.repo` và `local.repo` trong thư mục `/etc/yum.repos.d` từ **comput16** sang **compute12**.
- Cập nhật repo:
```
# yum update
```
- Tiếp theo, cài đặt Docker-ce:
```
# yum install docker-ce
```
- Cấu hình cho Docker bằng cách tạo thư mục `/etc/systemd/system/docker.service.d/` và file `/etc/systemd/system/docker.service.d/kolla.conf` với nội dung sau:
```
[Service]
MountFlags=shared
ExecStart=
ExecStart=/usr/bin/dockerd -H unix:///var/run/docker.sock -H tcp://0.0.0.0:8375 --insecure-registry 10.240.193.23:5555 --insecure-registry 10.240.193.23:7890 --insecure-registry 10.240.193.23:7891
```
- Khởi động lại Docker:
```
# systemctl deamon-reload
# systemctl restart docker
```
- Enable Docker:
```
# systemctl enable docker
```
- Tiếp theo, cài đặt và cấu hình **python-pip**:
```
# yum install python-pip
```
- Cấu hình **pip** bằng cách tạo thư mục `~/.config/pip/` và file `~/.config/pip/pip.conf` với nội dung như sau:
```
[global]
trusted-host =  10.240.173.23
index = http://10.240.173.23:8081/repository/pypi/pypi/
index-url = http://10.240.173.23:8081/repository/pypi/simple
extra-index-url = http://10.240.173.23:8081/repository/pypi/simple/
```
- Sử dụng pip cài đặt các gói thư viện docker sau (**CHÚ Ý**: Đúng phiên bản):
```
# pip install docker==3.1.1
# pip install docker-pycreds==0.2.2
```
- Kiểm tra cài đặt và cấu hình docker bằng cách pull image:
```
# docker pull 10.240.193.23:5555/cloud_lab/cadvisor:v0.28.3
v0.28.3: Pulling from cloud_lab/cadvisor
ab7e51e37a18: Pull complete 
cfffefa623d9: Pull complete 
160c5e57cbb9: Pull complete 
Digest: sha256:34d9d683086d7f3b9bbdab0d1df4518b230448896fa823f7a6cf75f66d64ebe1
Status: Downloaded newer image for 10.240.193.23:5555/cloud_lab/cadvisor:v0.28.3
```
## III. Cấu hình kolla-ansible và triển khai
Truy cập vào **controller23** để thay đổi cấu hình kolla-ansible và thực hiện triển khai. 
- cd vào thư mục `kolla-deployment`.
- Thêm 2 compute host là `compute11` và `compute12`vào section `[external-compute]` trong file ``:
```
# external-compute is the groups of compute nodes which can reach
# outside
[external-compute]
compute11
compute12
compute16
compute17
compute18
compute19
compute20
```
- Triển khai lại kolla-ansible với các `tags` là các task phù hợp cần thực hiện trên compute host.	

```bash
./kolla-ansible -i /root/kolla-deployment/multinode deploy --tags=ceilometer,nova,neutron,openvswitch,ovs-dpdk
```
- Kết thúc quá trình deploy, 2 host `compute11` và `compute12` sẽ được thêm vào cluster. Thực hiện tạo instance và kiểm tra kết nối để đảm bảo quá trình deploy thành công.
