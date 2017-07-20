# learning Ansible 2
## Chương 1: Giới thiệu về IT automation
## Chương 2: Giới thiệu về Ansible
## 2.1. Kiến trúc Ansible
## 2.2. Cài đặt Ansible
## 2.3. Cấu hình Ansible
File cấu hình của ansible sử dụng format là INI để lưu trữ dữ liệu cấu hình. Bạn có thể overwrite gần như tất cả cấu hình của ansible thông qua các tùy chọn khi thực hiện các playbook (khái niệm này sẽ được nói đến chi tiết sau) hoặc thông qa các biến môi trường.

Khi một câu lệnh ansible được chạy, câu lệnh này sẽ nhìn vào các file cấu hình của nó trong một thứ tự nhất định đã được định nghĩa trước đó như sau:
- **ANSIBLE_CONFIG**: Đầu tiên, ansible sẽ kiểm tra biến môi trường này. Biến môi trường này sẽ trỏ đến file config.
- **./ansible.cfg**: Tiếp theo, nó sẽ kiểm tra file này trong thư mục hiện tại.
- **~/.ansible.cfg**: Thứ ba, nó sẽ kiểm tra file này trong thư mục /home của user
- **/etc/ansible/ansible.cfg**: Cuối cùng, nó sẽ kiểm tra file này. Đây là file được tạo ra mặc định khi cài đặt ansible thông qua một package manager.

Nếu cài đặt ansible thông qua một package manager hoặc thông qua pip, một **ansible.cfg** file sẽ được tạo ra trong thư mục **/etc/ansible**. Nếu ansible được cài đặt thông qua Git repository thì bạn sẽ tìm thấy **ansible.cfg** file trong thư mục mà bạn clone Git repo của ansible.

### Config thông qua biến môi trường
Chúng ta có thể config ansible thông qua biến môi trường có biến bắt đầu từ **ANSIBLE_**. Một ví dụ như sau:
```
    $ export ANSIBLE_SUDO_USER=root
```
Các biến môi trường có thể được sử dụng trong các playbooks
## Config sử dụng ansible.cfg
Ansible có nhiều tham số cấu hình, nhưng chúng ta có thể không cần đến tất cả. Dưới đây là nhưng tham số hay được sử dụng trong khi làm việc với ansible:
- **hostfile**: Biến này có giá trị là đường dẫn đến `inventory` file, đây là file chứa thông tin về các host và group mà ansible có thể kết nối đến. Ví dụ:
```
hostfile = /etc/ansible/hosts
```
- **library**: Bất cứ khi nào thực hiện một hành động bởi ansible, cho dù là thực hiện trên local host (máy đang cài đặt ansible) hay là trên một remote host. Nó sẽ sử dụng một phần code để thực hiện hành động đó, phần code này gọi là **module**. Biến **library** này có giá trị là đường dẫn đến thư mục chứa các module. Mặc định các thư viện của ansible được lưu trữ ở thư mục có đường dẫn sau:
```
library = /usr/share/ansible
```
- **forks**: Biến này cho biết số lượng process mặc định được sinh ra khi chạy các câu lệnh của ansible. Mặc định là sử dụng tối đa 5 tiến trình chạy song song.
```
forks = 5
```
- **sudo_user**: Biến này xác định người dùng mặc định để thực thi các câu lệnh. Biến này có thể được overwrite trong playbooks (xem chi tiết ở phần sau).
```
sudo_user = root
```
- **remote_port**: Biến này xác định port được sử dụng để kết nối SSH, mặc định là 22. Bạn không cần phải thay đổi giá trị này, trừ khi port SSH của bạn bị thay đổi thành một giá trị khác.
```
remote_port = 22
```
- **host_key_checking**: Biến này được sử dụng để vô hiệu hóa quá trình kiểm tra key của SSH host, mặc định là **True**.
```
host_key_checking = False
```
- **timeout**: Đây là giá trị mặc định cho timeout của kết nối SSH.
```
timeoute = 60
```
- **log_path**: Mặc định, ansible không ghi log vào bất kỳ một file nào. Nếu chúng ta muốn ghi output của ansible đến 1 file nào đó, hãy gán giá trị cho biến này là đường dẫn đến file bạn muốn lưu. Ví dụ:
```
log_path = /var/log/ansible.log
```

## Chương 3: Cơ bản về ansible
Nhưng chúng ta cũng đã biết, ansible được sử dụng cho cả hai nhiệm vụ là tạo ra và quản lý toàn bộ một cơ sở hạ tầng, cũng có thể được tích hợp vào một cơ sở hạ tầng đã có trước đó.

Trong chương này, chúng ta sẽ tìm hiểu các vấn đề sau:
- Một playbook là gì? Cách playbook hoạt động như thế nào?
- Cách tạo ra một webserver sử dụng ansible
- Kiến thức cơ bản về Jinja 2 template engine

Đầu tiên, chúng ta sẽ tìm hiểu về YAML (YAML Ain't Markup Language), một ngôn ngữ tuần tự hóa dữ liệu (serialization language) được sử dụng rộng rãi trong ansible.

## 3.1. YAML
YAML cũng tương tự như các ngôn ngữ tuần tự hóa dữ liệu khác (chẳng hạn như JSON, XML,...) có một số định nghĩa cơ bản sau:
- Declaration
- List
- Associative arrays

Khai báo biến trong YAML cũng tương tự như các ngôn ngữ lập trình khác, đó là:
```
	name: 'This is the name'
```

Để tạo ra một list, sử dụng dấu ` - `:
```
	- item 1
    - item 2
    - item 3
```

Sử dụng **thụt vào đầu dòng** để tạo ra các dictionary, nếu chúng ta muốn tạo ra một chuỗi liên kết, chỉ cần thêm một thụt vào đầu dòng:
```
	item:
    	name: TheName
        location: TheLocation
```

Cuối cùng, chúng ta có thể kết hợp tất cả lại với nhau:
```
	people:
    	- name: Albert
          number: +1000000
          country: USA
        - name: David
		  number: +4400000
          country: UK
```

Còn rất nhiều kiến thức về YAML, nhưng ở đây chúng ta chỉ cần hiểu cách khai báo và định nghĩa các biến, các list và dictionary để phục vụ cho việc học ansible.

## 3.2. Hello Ansible
Đầu tiên, chúng ta sẽ tạo ra 1 task cơ bản là ping đến 2 host và sau đó sẽ echo 'Hello Ansible' lên các host. Các bước thực hiện như sau:
- Tạo ra một `inventory` file. File này định nghĩa các host hoặc nhóm các host được dùng để thực hiện các task. Mỗi nhóm được định nghĩa trong một dấu ngoặc vuông. Ví dụ sau chúng ta có 1 group:
	```
	$ cat inventory
    [servers]
	192.168.1.83 ansible_user=vm3
	25.9.172.231  ansible_user=ubuntu

	```
- Bây giờ, chúng ta sẽ thực hiện ping 2 máy với nhau. Sử dụng thêm câu lệnh `ansible --help` để biết thêm về các option của ansible. Để kiểm tra ping giữa 2 máy, thực hiện câu lệnh sau:
	```
	$ ansible servers -i inventory -m ping
    192.168.1.83 | SUCCESS => {
    "changed": false,
    "ping": "pong"
    }
    25.9.172.231 | SUCCESS => {
        "changed": false,
        "ping": "pong"
    }

    ```
- Sau khi ping được giữ 2 máy thành công, chúng ta sẽ thực hiện in dòng chữ **Hello Ansible** đến các host trong group **servers**:
	```
    $ ansible servers -i inventory -m command -a '/bin/echo Hello Ansible'
    192.168.1.83 | SUCCESS | rc=0 >>
    Hello Ansible

    25.9.172.231 | SUCCESS | rc=0 >>
	Hello Ansible

    ```

Như vậy là chúng ta đã in được dòng chữ **Hello Ansible** lên các host trong group **servers** (kết quả như trong output của câu lệnh trên). Bây giờ, hãy xem xét các câu lệnh đã dùng ở trên:
```
	ansible servers -i inventory -m command -a '/bin/echo Hello Asible'
```
Trong câu lệnh này, **servers** là tên của group hoặc host muốn thực thi task, tùy chọn `-i inventory` sẽ là cung cấp file chứa thông tin về các group và host (trong trường hợp này inventory file chứa group server). Để thực hiện trên tất cả các hosts trong `inventory` file, thay thế **servers** bằng **all**. Tùy chọn m là tên module được sử dụng để thực thi (chúng ta sẽ nói nhiều hơn về module ở phần sau). và cuối cùng là tùy chọn a được sử dụng để cung cấp tham số cho module để thực thi, với lệnh `/bin/echo Hello Ansible`.

Ngoài ra, để cung cấp thông tin thêm về quá trình thực thi cũng như troubleshot, chúng ta có thể sử dụng thêm tùy chọn **v**, **vv** hoặc là **vvv** để output sẽ cung cấp thêm các thông tin chi tiết hơn về quá trình thực thi.
## Chương 4: Playbook
Playbook là một trong các tính năng chính của ansible, nó nói cho ansible biết những gì cần thực hiện. Playbook giống như một **TODO** list của ansible để chứa danh sách các task. Mỗi task sẽ liên kết đến một **module** để thực hiện nhiệm vụ này. Playbook có cấu trúc rất đơn giản, dễ hiểu (được viết theo định dạng YAML), trong đó, module là một phần code của ansible hoặc được định nghĩa bởi người dùng bằng bất cứ ngôn ngữ lập trình nào, với điều kiện là output dưới dạng JSON. Có thể có nhiều task trong một playbook, các task này sẽ được thực hiện theo thứ tự từ trên xuống dưới.
## 4.1. Một playbook cơ bản
Playbook có thể có một danh sách các host, user variable, handler, task,.... Playbook cũng có thể overwrite hầu hết các cấu hình được định nghĩa trong các file cấu hình (như được nói đến ở phần trước). Bây giờ, hãy nhìn vào một ví dụ sau.

Chúng ta sẽ tạo ra một playbook để đảm bảo rằng apache package sẽ được cài đặt, dịch vụ phải được **enabled** và **started**. Dưới đây là nội dung của một playbook có tên là `setup_apache.yml`:
```
- hosts: all
  remote_user: centos
  tasks:
	- name: Ensure the HTTPd package is installed
	  yum:
		name: httpd
		state: present
		become: True
	- name: Ensure the HTTPd service is enabled and running
	  service:
		name: httpd
		state: started
		enabled: True
		become: True
```

File `setup_apache.yml` là ví dụ cho một playbook. File này bao gồm 3 thành phần chính sau:
- **hosts**: Đây là danh sách các host hoặc các group mà chúng ta muốn thực hiện task. Trường này là bắt buộc và mỗi playbook phải có trường này. Nó sẽ nói với ansible rằng những host nào sẽ chạy danh sách các task này. Khi một host hoặc một group host được cung cấp, ansible sẽ tìm kiếm thông tin của host trong **inventory** file được cung cấp. Nếu không tìm thấy, ansible sẽ bỏ qua tất cả các task đối với host hoặc group host này.
- **remote_user**: Đây là một tham số cấu hình của ansible mà được overwrite ở playbook, tham số này xác định cụ thể user nào thực hiện các task trong remote host.
- **tasks**: Cuối cùng là các task. Task là một danh sách các hoạt động mà chúng ta muốn thực hiện. Mỗi trường task chứa tên của task (trường **name**), một module để thực thi task, và các tham số được yêu cầu đối với mỗi module.

Trong ví dụ trên, chúng ta có hai task. Tham số **name** đại diện cho những task nào đang thực thi và được hiển thị cho người dùng có thể đọc được, như chúng ta có thể thấy được trong khi playbook chạy. Tham số **name** là tùy chọn. Các module, chẳng hạn như **yum**,**service** đều có một tập các tham số của nó. Hầu hết các module đều có tham số **name** (có một số module không có tham số này chẳng hạn module **debug**), tham số này cho biết những thành phần gì của module mà hành động sẽ thực hiện lên. Tiếp tục nhìn vào các tham số khác:
- Trong trường hợp module **yum**, tham số **state** có giá trị latest và nó chỉ ra rằng gói **httpd** latest cần phải được cài đặt. Nó tương tự với câu lệnh: `yum install httpd`
- Trong kịch bản của module **service**, tham số **state** có giá trị là started và nó chỉ rằng dịch vụ httpd cần phải được start. Nó tương tự với câu lệnh: `/etc/init.d/httpd start`
- **become: True** để xác định rằng các task nên được chạy dưới quyền sudo.

Nhưng vậy là chúng ta đã có được một playbook đơn giản, thực hiện 2 task là cài đặt và khởi động dịch vụ apache. Bây giờ, chúng ta sẽ thực hiện chạy playbook này.
### Chạy playbook
Chúng ta sẽ dụng câu lệnh sau để chạy playbook:
```
$ ansible-playbook -i inventory setup_apache.yml
```
Câu lệnh này có một ít thay đổi so với câu lệnh được dùng trong phần trước. Câu lệnh **ansible-playbook** được dùng để thực thi một playbook, với tùy chọn **i** là đường dẫn đến file chứa thông tin của remote host. và **setup_apache.yml** là đường dẫn đền playbook muốn chạy. Và kết quả thu được như sau:
```
PLAY [servers] ***************************************************

TASK [Gathering Facts] *******************************************
ok: [192.168.1.192]

TASK [Ensure the HTTPd package is installed] *********************
changed: [192.168.1.192]

TASK [Ensure the HTTPd service is enabled and running] ***********
changed: [192.168.1.192]

PLAY RECAP *******************************************************
192.168.1.192  : ok=3     changed=2   unreachable=0     failed=0
```

Như vậy là playbook đã hoạt động như mong muốn. Bây giờ, trên remote host, hãy kiểm tra xem **httpd** pakage đã được cài đặt và được start chưa. Chúng ta sử dụng câu lệnh sau:
```
$ rpm -qa | grep httpd
```
Kết quả thu được sẽ là:
```
httpd-tools-2.4.6-45.el7.centos.4.x86_64
httpd-2.4.6-45.el7.centos.4.x86_64
```
Và thực hiện check status của httpd service:
```
$ systemctl status httpd
```
Kết quả thu được như sau:
```
httpd.service - The Apache HTTP Server
Loaded: loaded (/usr/lib/systemd/system/httpd.service; enabled; vendor preset: disabled)
Active: active (running) since Tue 2017-07-18 09:43:26 ICT; 15min ago
     Docs: man:httpd(8)
           man:apachectl(8)
Main PID: 4588 (httpd)
   Status: "Total requests: 0; Current requests/sec: 0; Current traffic:   0 B/sec"
   CGroup: /system.slice/httpd.service
           ├─4588 /usr/sbin/httpd -DFOREGROUND
           ├─4589 /usr/sbin/httpd -DFOREGROUND
           ├─4590 /usr/sbin/httpd -DFOREGROUND
           ├─4591 /usr/sbin/httpd -DFOREGROUND
           ├─4592 /usr/sbin/httpd -DFOREGROUND
           └─4593 /usr/sbin/httpd -DFOREGROUND
```

Bây giờ, chúng ta hãy xem xét chuyện gì đã xảy ra khi playbook chạy. Đâu tiên, quan sát output ở trên ta thấy:
```
PLAY [servers] ***************************************************

TASK [Gathering Facts] *******************************************
ok: [192.168.1.192]
```

Dòng đầu tiên mà playbook biểu diễn để nói với chúng ta rằng playbook sẽ được bắt đầu và thực thi trên các host thuộc group **servers**. Tiếp theo là **Gathering Facts**, đây là task mặc định của ansible trước khi thực thi các task được liệt kê trong playbook. Task này thực hiện thu thập thông tin của remote host, những thông tin này sẽ được lưu vào trong một tập các biến được bắt đầu bằng **ansible_** và có thể được sử dụng sau này. Kết quả trả về là **ok**, tức là task đã hoàn thành và không có thay đổi gì xảy ra trên host **192.168.1.192**.
```
TASK [Ensure the HTTPd package is installed] *********************
changed: [192.168.1.192]

TASK [Ensure the HTTPd service is enabled and running] ***********
changed: [192.168.1.192]
```

Hai task này được liệt kê trong playbook và được thực hiện thành công. Kết quả là trạng thái của host **192.168.1.192** đã thay đổi, vì đã cài thêm httpd package và khởi động dịch vụ này.

Cuối cùng là dòng output sau:
```
PLAY RECAP *******************************************************
192.168.1.192  : ok=3     changed=2   unreachable=0     failed=0
```

Dòng này sẽ tổng kết lại các kết quả đã đạt được sau khi playbook thực hiện xong task. **ok=3** là số task hoàn thành trên remote host **192.168.1.192**, **changed=2** là trạng thái của remote host đã thay đổi 2 lần, **unreachable=0** là số lượng host không thể kết nối đến được là 0, **failed=0** là số lượng lỗi xảy ra trên remote host trong quá trình thực hiện các task.

Bây giờ, hãy thực hiện lại câu lệnh chạy playbook lần thứ 2. Kết quả thu được như sau:
```
PLAY RECAP *******************************************************
192.168.1.192  : ok=3     changed=0   unreachable=0     failed=0
```

Chúng ta có thể thấy, trạng thái **changed** cho thấy số lượng thay đổi trạng thái trên remote host bây giờ là 0. Nguyên nhân là do remote host **192.168.1.192** đã đạt được trạng thái mong muốn, các task này đã được thực hiện thành công bởi lần chạy trước đó.

Như vậy là chúng ta đã biết được những kiến thức cơ bản về một playbook. Bây giờ, chúng ta sẽ đi sâu vào từng thành phần để hỗ trợ thêm kiến thức về playbook.

### Ansible verbosity
Nhưng đã được nói qua trong phần trước, câu lệnh **ansible-playbook** có một tùy chọn debug. Tùy chọn này sẽ hiển thị thông tin output nhiều hơn, để chúng ta có thể dễ dàng biết được những gì đang diễn ra khi playbook chạy. Mỗi một **v** được thêm vào sẽ cung cấp nhiều thông tin ouput hơn.

Hãy thử chạy câu lệnh **ansible-playbook** với tùy chọn debug để xem chúng ta sẽ thu được gì. Ví dụ:
```
$ ansible-playbook -i inventory setup_apache.yml -vvv
```
### Variables in playbooks
Playbook hỗ trợ cho chúng ta khả năng có thể định nghĩa và sử dụng các biến tương tự như các ngôn ngữ lập trình. Mục đích là để playbook có thể được sử dụng một cách mềm dẻo hơn, có khả năng tái sử dụng và đơn giản hóa một playbook.

Hãy xem xét một ví dụ để biết được cách sử dụng biến trong playbook:
```
- hosts: servers
  remote_user: centos
  tasks:
	- name: Set variable 'name'
	  set_fact:
		name: Test machine
	- name: Print variable 'name'
	  debug:
		msg: '{{ name }}'
```
Chạy playbook với cách thông thường:
```
$ ansible-playbook -i inventory variables.yml
```

Kết quả sẽ được trả lại như sau:
```
PLAY [servers] *************************************************************

TASK [Gathering Facts] *****************************************************
ok: [192.168.1.192]

TASK [Set variable 'name']**************************************************
ok: [192.168.1.192]

TASK [Print variable 'name']************************************************
ok: [192.168.1.192] => {
    "msg": "Test machine"
}

PLAY RECAP******************************************************************
192.168.1.192              : ok=3    changed=0    unreachable=0    failed=0
```

Một biến trong ansible được gọi là một **fact**. Trong ví dụ trên, chúng ta đã định nghĩa một biến là **name: Test machine** và sau đó sử dụng module **debug** để in ra biến **name** vừa được định nghĩa.

Ansible cho phép chúng ta thiết lập các biến trong nhiều cách khác nhau: Định nghĩa trong một file, sau đó include vào playbook; định nghĩa ngay trong playbook; truyền biến thông qua command **ansible-playbook** sử dụng tùy chọn **-e**; hoặc có thể định nghĩa trong file **inventory**.

Ngoài ra, chúng ta cũng có thể sử dụng thông tin metadata mà ansible thu thập được trong giai đoạn thu thập thông tin. Sử dụng câu lệnh sau để xem thông tin metadata mà ansible thu thập được:
```
ansible all -i HOST, -m setup
```
Kết quả hiển thị như sau ( thông tin quá nhiều nên ở đây bị cắt bỏ một số phần):
```
192.168.1.192 | SUCCESS => {
    "ansible_facts": {
        "ansible_all_ipv4_addresses": [
            "192.168.1.192"
        ], 
        "ansible_all_ipv6_addresses": [
            "fe80::a852:2a2c:5a1:674a"
        ], 
        "ansible_apparmor": {
            "status": "disabled"
        }, 
        "ansible_architecture": "x86_64", 
        "ansible_bios_date": "12/01/2006", 
        "ansible_bios_version": "VirtualBox", 
        "ansible_cmdline": {
            "BOOT_IMAGE": "/vmlinuz-3.10.0-514.el7.x86_64", 
            "LANG": "en_US.UTF-8",
            "crashkernel": "auto",
            "quiet": true,
            "rd.lvm.lv": "cl/swap",
            "rhgb": true,
            "ro": true,
            "root": "/dev/mapper/cl-root"
        },
        "ansible_date_time": {
            "date": "2017-07-18",
            "day": "18",
            "epoch": "1500350715", 
            "hour": "11",
            "iso8601": "2017-07-18T04:05:15Z", 
            "iso8601_basic": "20170718T110515004017", 
            "iso8601_basic_short": "20170718T110515", 
            "iso8601_micro": "2017-07-18T04:05:15.004125Z", 
            "minute": "05", 
            "month": "07", 
            "second": "15", 
            "time": "11:05:15", 
            "tz": "ICT", 
            "tz_offset": "+0700", 
            "weekday": "Thứ ba", 
            "weekday_number": "2", 
            "weeknumber": "29", 
            "year": "2017"
        }, 
        "ansible_default_ipv4": {
            "address": "192.168.1.192", 
            "alias": "enp0s3", 
            "broadcast": "192.168.1.255",
            "gateway": "192.168.1.254",
            "interface": "enp0s3",
		....
```
Chúng ta có thể thấy một danh sách rất lớn các thông tin của remote host. Bây giờ, chúng ta sẽ sử dụng các biến này trong playbook để in ra tên và version của OS của remote host. Playbook có nội dung như sau:
```
- hosts: servers
  remote_user: centos
  tasks:
    - name: Print OS and version
      debug:
           msg: '{{ ansible_distribution }} {{ ansible_distribution_version }}'
```
Chạy playbook và chúng ta sẽ thu được kết quả như sau:
```
$ ansible-playbook playbooks/os_info.yml -i inventory
PLAY [servers] ************************************************************

TASK [Gathering Facts]*****************************************************
ok: [192.168.1.192]

TASK [Print OS and version]************************************************
ok: [192.168.1.192] => {
    "msg": "CentOS 7.3.1611"
}

PLAY RECAP*****************************************************************
192.168.1.192              : ok=2    changed=0    unreachable=0    failed=0

```
Kết quả in ra mà thông tin về OS và version của remote host đang được kết nối đến. Và đây là một ví dụ về truyền biến thông qua command **ansible-playbook** với tùy chọn **-i**:
```
$ ansible-playbook playbooks/os_info.yml -i inventory -e 'name=test01'
```

Bây giờ chúng ta đã có những kiến thức cơ bản về playbook. Tiếp theo, hãy đi vào một số ví dụ phức tạp hơn.
### Tạo một user bằng Ansible
Mục tiêu của playbook này là tạo một user mà có khả năng truy cập được với một SSH key, và có thể thực hiện được các hành động như các người dùng khác mà không cần hỏi password, tức là có quyền root. Playbook sẽ có nội dung như sau:
```
- hosts: servers
  user: root
  tasks:
   - name: Ensure ansible user exist
     user:
        name: ansible
        state: persent
        comment: Ansible
   - name: Ensure ansible user accepts the SSH key
     authorized_key:
        user: ansible
        key: /home/huynhduc/.ssh/id_rsa.pub
        state: present
   - name: Ensure the ansible user is sudoers with no password required
     lineinfile:
        dest: /etc/sudoers
        state: present
        regexp: '^ansible ALL\='
        line: 'ansible ALL=(ALL) NOPASSWD:ALL'
        validate: 'visudo -cf %s'

```
Trước khi chạy, chúng ta sẽ nói qua một chút về playbook này. Ở đây, chúng ta sử dụng 3 module là: **user**, **autorized_key**, **lineinfile**. Đối với module **user**, như tên gọi của nó, module này thực hiện thêm, sửa hoặc xóa user.

Đối với module **authorized_key**, module này cho phép sao chép public SSH key đến một user cụ thể ở remote host. Trong trường hợp này, chúng ta sẽ sao chép public key của máy đang chạy ansible (được gọi là local host) đến user có tên là **ansible** trong remote host. Tham số **key** là một string (public key của local host) hoặc là 1 url chẳng hạn như https://github.com/username.keys. Module này không thay đổi tất cả SSH key của user, mà chỉ đơn giản là thêm hoặc xóa (phụ thuộc vào tham số **state** là present hay là absent) một key cụ thể nào đó.

Đối với module **lineinfile**, module này cho phép chúng ta có thể thay đổi nội dung của một file. Nó làm việc tương tự với câu lệnh **sed** trong command line. Bạn sẽ xác định biểu thức chính quy để tìm đến dòng phù hợp thông qua tham số **regexp**, và sau đó là xác định dòng mới cần thêm thay thế nếu như tìm thấy dòng phù hợp với biểu thức chính quy. Trong trường hợp không tìm thấy, dòng mới sẽ được thêm đến cuối file.

Bây giờ, hãy chạy playbook này:
```
$ ansible-playbook -i inventory playbooks/firstrun.yml

PLAY [servers]*************************************************************

TASK [Gathering Facts]*****************************************************
ok: [192.168.1.192]

TASK [Ensure ansible user exist]*******************************************
ok: [192.168.1.192]

TASK [Ensure ansible user accepts the SSH key]*****************************
changed: [192.168.1.192]

TASK [Ensure the ansible user is sudoers with no password required]********
changed: [192.168.1.192]

PLAY RECAP ****************************************************************
192.168.1.192              : ok=4    changed=2    unreachable=0    failed=0
```
Như vậy là chúng ta đã có một user **ansible**, copy ssh key đến user này và thực hiện gán quyền thực hiện các hành động không cần hỏi password.

Tiếp theo, chúng ta sẽ xem xét qua một nội dung khá của ansible, đó là **Jinja2 template**

## 4.1. Jinj2 template
Jinja2 template là một template engine được sử dụng rộng rãi trong python. Jinja2 template cũng được sử dụng để tạo ra các file trên remote host. Ở trong bài viết này, chúng ta chỉ tìm hiểu những khái niệm cơ bản cần thiết để làm việc với ansible.
### Variables
Chúng ta có thể in ra nội dung của một biến với cú pháp đơn giản sau:
```
{{ VARIABLE_NAME }}
```
Chúng ta có thể in ra nội dung của một phần tử trong một array:
```
{{ ARRAY_NAME['KEY'] }}
```
Nếu muốn in ra một thuộc tính của một object, sử dụng câu lệnh sau:
```
{{ OBJECT_NAME.PROERTY_NAME }}
```
### Conditional
Một tính năng thường xuyên được sử dụng trong template nữa đó là câu điều kiện. Nó sẽ in ra các giá trị khác nhau tùy vào điều kiện cụ thể. Dưới đây là một ví dụ:
```
<html>
	<body>
		<h1>Hello World!</h1>
		<p>This page was created on {{ ansible_date_time.date}}.</p>
		{% if ansible_eth0.active == True %}
			<p>eth0 address {{ ansible_eth0.ipv4.address }}.</p>
		{% endif %}
	</body>
</html>
```
Đây là một template đơn giản, nó sẽ in ra thời gian là ngày hiện tại của remote host thông qua cú pháp `{{ ansible_data_time.date }}`. Tiếp theo, là một câu điều kiện, kiểm tra nếu thuộc tính *active* của object *ansible* là `ansible_eth0.active == True` thì sẽ in ra địa chỉ mạng của eth0 thông qua cú pháp `{{ ansible_eth0.ipv4.address }}`
### Cycles
Jinja2 template cũng hỗ trợ khar năng để tạo ra các vòng lặp. Dưới đây sẽ mở rộng cho ví dụ trên, chúng ta sẽ in ra địa chỉ IPv4 của mỗi card mạng có trong remote host. Đây là nội dung của file `template.html`
```
<html>
	<body>
        <h1>Hello World!</h1>
        <p>This page was created on {{ ansible_date_time.date}}.</p>
        <p>This machine can be reached on the following IPaddresses</p>
        <ul>
            {% for address in ansible_all_ipv4_addresses %}
                <li>{{ address }}</li>
            {% endfor %}
        </ul>
	</body>
</html>
```
Cú pháp của vòng lặp cũng tương tự như cú pháp trong python. Tiếp theo, chúng ta sẽ xem xét một ví dụ của Jinja2 template.
### Example with Jinja2 template
Chúng ta sẽ thực hiện tạo ra một file trên remote host với `template.html` đã tạo ra ở phần trước. Playbook sẽ có nội dung như sau:
```
- hosts: servers
  remote_user: centos
  tasks:
    - name: User template to create file in home directory
      template:
         src: template/template.html
         dest: /var/www/html/index.html
         owner: root
         group: root
         mode: 0644
      become: True
```
Chạy playbook và output như sau:
```
ansible-playbook -i inventory playbooks/template.yml

PLAY [servers]**************************************************************

TASK [Gathering Facts]******************************************************
ok: [192.168.1.192]

TASK [User template to create file in home directory]***********************
changed: [192.168.1.192]

PLAY RECAP******************************************************************
192.168.1.192              : ok=2    changed=1    unreachable=0    failed=0

```
Bây giờ, chúng ta đã tạo ra một file `/var/www/html/index.html` trên remote host.
Có thể kiểm tra bằng câu lệnh sau, chúng ta sẽ thu được nội dung như sau:
```
$ cat /var/www/html/index.html
<html>
	<body>
	<h1>Hello World!</h1>
	<p>This page was created on 2017-07-18.</p>
	<p>This machine can be reached on the following IPaddresses</p>
	<ul>
					<li>192.168.1.192</li>
	</ul>
</body>
</html>

```
Như vậy là file cuối cùng thu được có nội dung đúng như mong muốn.
## Chương 3: Scaling to multiple host
Trong chương trước chúng ta đã xác định được các host để thực hiện các hành động. Nhưng chúng ta vẫn chưa quản lý được các host này. Chương này sẽ nói rõ về nội dung này. Nội dung của chương này có các phần sau:
- Ansible inventories
- Ansible host/group variables
- Ansible loops

## 3.1. Inventory file
Inventory là một file được định dạng theo format INI (Initiaization) và sẽ nói với Ansible các hosts sẽ được sử dụng để thực hiện các task.

Ansible có thể chạy các tasks trên nhiều host song song với nhau. Để làm được điều này, ansible cho phép chúng ta gom nhóm các host vào các group trong inventory file, sau đó sẽ truyền tên của group đến ansible. Ansible sẽ tìm kiếm group trong inventory file và chạy các task trên các host trong group song song với nhau.

Chúng ta có thể truyền inventory file đến ansible sử dụng tùy chọn **-i** theo sau là đường dẫn đến inventory file. Nếu inventory file không được xác định, thì mặc định ansible sẽ sử dụng đường dẫn trong tham số `host_file` trong file cấu hình `ansible.cfg` của ansible. Nếu giá trị của tùy chọn **-i** là một list (chứa tối thiểu 1 dấu phẩy), ansible sẽ xem đó là một danh sách inventory file, còn lại ansible sẽ xem đó là đường dẫn đến inventory file.

### Basic inventory file
Trước khi đi sâu vào khái niệm này, chúng ta sẽ nhìn vào một inventory file cơ bản có tên là **hosts**, với nội dung như sau:
```
host1.foo.io
host2.foo.io
host3.foo.io
```
Chạy playbook với tùy chọn `-i` có giá trị là đường dẫn đến file **hosts** trong câu lệnh sau:
```
$ ansible-playbook -i hosts webserver.yml
```
Khi thực thi, ansible sẽ tìm đến file **hosts** để lấy thông tin của host được chỉ đến trong tham số **hosts** được định nghĩa ở file playbook.
### Groups in inventory file
Một group là đại diện cho một danh sách các host mà khi ansible gọi đến tên của group, thì các task của ansible sẽ được thực hiện song song trên các host trong group. Group được định nghĩa trong dấu ngoặc vuông. File **hosts** sẽ được thay đổi như sau:
```
$ cat hosts
[webserver]
ws01.fale.io
ws02.fale.io
ws03.fale.io
ws04.fale.io

[database]
db01.fale.io
```
Để gọi đến group trong playbook, chúng ta chỉ cần gán giá trị cho tham số **hosts** trong playbook là tên của group. Ví dụ như sau:
```
- hosts: webserver
  ....

- hosts: database
  ....
```
### Regular expression in inventory file
Khi chúng ta có một lượng lớn các host trong inventory file với các tên tương tự nhau. Ví dụ, các server có tên là WEB01, WEB02, WEB03,... Chúng ta có thể giảm số lượng dòng trong file **hosts** bằng cách sử dụng regular expression. File **hosts** sẽ được thay đổi như sau:
```
[webserver]
ws[01:04].fale.io

[database]
db01.fale.io
```
Như vậy là thay vì chúng ta phải sử dụng 4 dòng để liệt kê ra các host thì bây giờ chỉ cần 1 dòng. Việc này sẽ có tác dụng khi số lượng host lớn.
## 3.2. Variables
Chúng ta có thể định nghĩa các biến theo nhiều cách:
- Định nghĩa bên trong playbook
- Định nghĩa trong 1 file riêng biệt, sau đó include vào playbook
- Truyền từ command ansible với tùy chọn `-e`
- Định nghĩa từ inventory file. Chúng ta có thể định nghĩa các biến trên từng host, hoặc là trên từng group.

Bây giờ, sẽ đi lần lượt từng cách định nghĩa khác nhau.
### Host variables
Chúng ta có thể định nghĩa các biến trên các host cụ thể, bên trong inventory file. Cho ví dụ như chúng ta muốn xác định các port khác nhau trên từng host cho webserver. Chúng ta có thể thực hiện định nghĩa các biến như sau trong file **hosts**
```
[webserver]
ws01.fale.io webserverport=10000
ws02.fale.io webserverport=10001
ws03.fale.io webserverport=10002
ws04.fale.io webserverport=10003

[database]
db01.fale.io
```
Như vậy, các host sẽ chạy webserver trên các port khác nhau.
### Group variables
Trong trường hợp chúng ta muốn định nghĩa một biến được sử dụng trong tất cả các host của một group. Chúng ta sẽ thực hiện như sau:
```
[webserver]
ws01.fale.io
ws02.fale.io
ws03.fale.io
 webserverport=10003

[webserver:vars]
httpd_enalbed=True

[database]
db01.fale.io
```
### Variable files
Trường hợp chúng ta có quá nhiều biến cho mỗi host hay quá nhiều biến cho một group cần phải định nghĩa. Chúng ta có thể tạo ra một file riêng để khai báo các biến đó, sau đó sẽ `include` vào trong inventory file. Thông thường, chúng ta sẽ đặt các file chứa các host variable vào trong một folder là `host_vars`, và tương tự với file chứa các group variable là `group_vars`.

**NOTE:** Các biến của inventory cũng tuân theo một thứ tự phân cấp, cụ thể là: các host variable sẽ ghi đè các group variable; và các group variable sẽ ghi đè các biến trong các group variable file. Chúng ta có thứ tự độ ưu tiên như sau:
```
host variable > host variable file > group variable > group variable file > playbook variable > command_line option -u
```
### Ghi đè biến thông qua một inventory file
Chúng ta cũng có thể ghi đè các tham số cấu hình thông qua một inventory file. Các tham số cấu hình này sẽ ghi đè lại tất các các tham số cấu hình tương tự mà được định nghĩa trong file cấu hình `ansible.cfg`, trong biến môi trường, và trong các playbooks. Các biến được khai báo trong inventory file này được truyền đến các câu lệnh `ansible-playbook` và `ansible` có quyền ưu tiên cao hơn các biến khác.

Dưới đây là các tham số mà chúng ta có thể ghi đè trong một inventory file:
- **ansible_user**: Tham số này được sử dụng để ghi đè tên user mà được sử dụng để kết nối đến remote host. Trong trường hợp mỗi host có một user khác nhau, tham số này sẽ giúp bạn.
- **ansible_port**: Tham số này sẽ ghi đè cổng port SSH mặc định đối với mỗi user xác định.
- **ansible_host**: Tham số này sẽ ghi đè tên bí danh của host
- **ansible_connection**: Tham số này xác định loại kết nối đến remote host. Các giá trị có thể đó là SSH, Paramiko hoặc local.
- **ansible_private_key_file**: Tham số này xác định private key được sử dụng cho SSH.

### Sử dụng vòng lặp trong ansible
Cũng như trong các ngôn ngữ lập trình khác, trong một số trường hợp, chúng ta có một số task mà có các tham số tương tự nhau, chỉ khác mỗi giá trị. Lúc đó, chúng ta sẽ sử dụng một danh sách các giá trị của các tham số tương tự đó. Ví dụ, để đảm bảo http và https có thể truyền qua firewall. Nếu không sử dụng danh sách thì chúng ta có playbook như sau:
```
- hosts: webserver
  remote_user: ansible
  tasks:
	- name: Ensure HTTP can pass the firewall
	  firewalld:
		service: http
	    state: enabled
	    permanent: True
	    immediate: True
      become: True
	- name: Ensure HTTPS can pass the firewall
  	  firewalld:
	  	service: https
		state: enabled
		permanent: True
		immediate: True
	  become: True
```
Để sử dụng danh sách, ansible hỗ trợ vòng danh sách đơn giản với cú pháp là `with_items`. Ví dụ sẽ được viết lại như sau:
```
- hosts: webserver
  remote_user: ansible
  tasks:
	- name: Ensure HTTP and HTTPS can pass the firewall
	  firewalld:
		service: '{{ item }}'
	    state: enabled
	    permanent: True
	    immediate: True
      become: True
      with_items:
		- http
		- https
```
Khi chạy playbook, chúng ta sẽ thu được kết quả như sau:
```
$ ansible-playbook -i hosts webserver.yaml
PLAY [webserver] *************************************************
TASK [setup] *****************************************************
ok: [ws01.fale.io]
ok: [ws02.fale.io]
TASK [Ensure the HTTPd package is installed] *********************
ok: [ws01.fale.io]
ok: [ws02.fale.io]TASK [Ensure the HTTPd service is enabled and running] ***********
ok: [ws02.fale.io]
ok: [ws01.fale.io]
TASK [Ensure HTTP can pass the firewall] *************************
ok: [ws02.fale.io]
ok: [ws01.fale.io]
TASK [Ensure HTTP and
ok: [ws02.fale.io] =>
ok: [ws01.fale.io] =>
ok: [ws02.fale.io] =>
ok: [ws01.fale.io] =>
HTTPS can pass the firewall] ***************
(item=http)
(item=http)
(item=https)
(item=https)
PLAY RECAP *******************************************************
ws01.fale.io
: ok=5
changed=0
unreachable=0
failed=0
```

