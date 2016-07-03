<h1><a name="install_config">Cấu hình và cài đặt Keystone</a></h1>
- Trước tiên, cần phải tạo ra một database cho dịch vụ keystone bằng các câu lệnh sau:
```sh
mysql -u root –pWelcome123
CREATE DATABASE keystone;

GRANT ALL PRIVILEGES ON keystone.* TO 'keystone'@'localhost' \
IDENTIFIED BY 'Welcome123';

GRANT ALL PRIVILEGES ON keystone.* TO 'keystone'@'%' \
IDENTIFIED BY 'Welcome123';
flush privileges;
exit;
```
- Cấu hình không cho dịch vụ keystone tự động khởi động:
```sh
echo "manual" > /etc/init/keystone.override
```
- Chạy lệnh sau để cài đặt các gói của keystone:
```sh
apt-get install keystone apache2 libapache2-mod-wsgi
```
- Cấu hinh file `/etc/keystone/keystone.conf` với các yêu cầu sau:
 - Trong phần `[default]`, định nghĩa giá trị của thẻ quản trị ban đầu:
  ```sh
  [DEFAULT]
  ...
  admin_token = Welcome123
  ```
 - Trong phần database, cấu hình truy cập đến database:
  ```sh
  [database]
  ...
  connection = mysql+pymysql://keystone:Welcome123@controller/keystone
  ```
  - Trong phần [token], cấu hình nhà cung cấp thẻ Fernet:
  ```sh  
  [token]
  ...
  provider = fernet
  ```
- Đồng bộ database dịch vụ xác thực:
  ```sh
  su -s /bin/sh -c "keystone-manage db_sync" keystone
  ```
- Thiết lập Fernet key:
  ```sh
  keystone-manage fernet_setup --keystone-user keystone --keystone-group keystone
  ```
<h3>cấu hình máy chủ Apache</h3>
- Chỉnh sửa file `/etc/apache2/apache2.conf` và cấu hình tùy chọn Servername để ánh xạ đến node controller:
```sh
ServerName controller
```
- Tạo file `/etc/apache2/sites-available/wsgi-keystone.conf` với nội dung sau:
```sh
Listen 5000
Listen 35357

<VirtualHost *:5000>
    WSGIDaemonProcess keystone-public processes=5 threads=1 user=keystone group=keystone display-name=%{GROUP}
    WSGIProcessGroup keystone-public
    WSGIScriptAlias / /usr/bin/keystone-wsgi-public
    WSGIApplicationGroup %{GLOBAL}
    WSGIPassAuthorization On
    ErrorLogFormat "%{cu}t %M"
    ErrorLog /var/log/apache2/keystone.log
    CustomLog /var/log/apache2/keystone_access.log combined

    <Directory /usr/bin>
        Require all granted
    </Directory>
</VirtualHost>

<VirtualHost *:35357>
    WSGIDaemonProcess keystone-admin processes=5 threads=1 user=keystone group=keystone display-name=%{GROUP}
WSGIProcessGroup keystone-admin
    WSGIScriptAlias / /usr/bin/keystone-wsgi-admin
    WSGIApplicationGroup %{GLOBAL}
    WSGIPassAuthorization On
    ErrorLogFormat "%{cu}t %M"
    ErrorLog /var/log/apache2/keystone.log
    CustomLog /var/log/apache2/keystone_access.log combined

    <Directory /usr/bin>
        Require all granted
    </Directory>
</VirtualHost>
```
- Cấp phép các máy ảo dịch vụ xác thực:
```sh
ln -s /etc/apache2/sites-available/wsgi-keystone.conf /etc/apache2/sites-enabled
```
- Khởi động lại apache:
```sh
service apache2 restart
```
- Xóa database mặc định của keystone:
```sh
rm -f /var/lib/keystone/keystone.db
```
<h3>Tạo endpoint và các service cho keystone</h3>
- Vì ban đầu, database của Keystone không chứa thông tin xác thực và catalog sevices nên để tạo được các endpoint và các service thì phải có một token để cho phép thực hiện bước này. 
- Truyền vào các biến môi trường để khởi tạo service và các endpoint indentity:
```sh
export OS_TOKEN=ADMIN_TOKEN
```
ADMIN_TOKEN ở đây là giá trị đã được khai báo trong file cấu hình ở bước trước.
- Khai báo URL endpoint và version API identity:
```sh
export OS_URL=http://controller:35357/v3
export OS_IDENTITY_API_VERSION=3
```
- Keystone quản lý một catalog các dịch vụ trong môi trường OpenStack. Các dịch vụ sử dụng catalog này để xác định các dịch vụ khác đang có trong môi trường.
- Tạo service cho dịch vụ identity:
```sh
openstack service create \
  --name keystone --description "OpenStack Identity" identity
```
- Keystone cũng quản lý một danh mục các endpoint API được kết nối với các dịch vụ trong môi trường OpenStack . Các dịch vụ sử dụng catalog này để xác định các giao tiếp với các dịch vụ khác trong môi trường OpenStack.
- Tạo các endpoints API: 
 - Public API endpoint:
 ```sh
 openstack endpoint create --region RegionOne \
 identity public http://controller:5000/v3
 ```
 - Internal API endpoint:
 ```sh
 openstack endpoint create --region RegionOne \
 identity internal http://controller:5000/v3
 ```
 - Admin API endpoint:
 ```sh
 openstack endpoint create --region RegionOne \
  identity public http://controller:5000/v3
 ```
<h3>Tạo domain, user, project và role</h3>
- Tạo domain `default`:
```sh
openstack domain create --description "Default Domain" default
```
- Tạo project `admin`:
```sh
openstack project create --domain default \
  --description "Admin Project" admin
```	
- Tạo user `admin`:
```sh
openstack user create --domain default \
  --password-prompt admin
```
- Và tạo role `admin`:
```sh
openstack role create admin
```	
- Gán role admin cho user `admin` đối với project `admin`:
```sh
openstack role add --project admin --user admin admin
```

<h3>Kiểm tra hoạt động</h3>
- Vì lý do bảo mật, vô hiệu hóa cơ chế thẻ token tạm thời bằng cách chỉnh sửa trong file `/etc/keystone/keystone-paste.ini`, xóa các dòng `admin_token_auth` từ các phần `[pipeline:public_api]`,`[pipeline:admin_api]` và `[pipeline:api_v3]`
- Gỡ bỏ các biến môi trường đã thiết lập trong quá trình tạo service và endpoint cho dịch vụ Identity.
- Kiểm tra hoạt động bằng cách yêu cầu token cho user “admin” đã tạo ở trên:
```sh
  openstack --os-auth-url http://controller:35357/v3 \
   --os-project-domain-name default --os-user-domain-name default \
   --os-project-name admin --os-username admin token issue
  Password:
```
  Nhập password vào và hiển thị kết quả như sau:
```sh
+------------+-----------------------------------------------------------------+
| Field      | Value                                                           |
+------------+-----------------------------------------------------------------+
| expires    | 2016-02-12T20:14:07.056119Z                                     |
| id         | gAAAAABWvi7_B8kKQD9wdXac8MoZiQldmjEO643d-e_j-XXq9AmIegIbA7UHGPv |
|            | atnN21qtOMjCFWX7BReJEQnVOAj3nclRQgAYRsfSU_MrsuWb4EDtnjU7HEpoBb4 |
|            | o6ozsA_NmFWEpLeKy0uNn_WeKbAhYygrsmQGA49dclHVnz-OMVLiyM9ws       |
| project_id | 343d245e850143a096806dfaefa9afdc                                |
| user_id    | ac3377633149401296f6c0d92d79dc16                                |
+------------+-----------------------------------------------------------------+
```
- Ngoài ra, để tăng hiệu quả của hoạt động ở phía client khi thực hiện yêu cầu token thì OpenStack hỗ trợ một kịch bản môi trường client
- Tạo kịch bản môi trường client cho user “admin” bằng cách tạo file `admin-openrc` với nội dung sau:
```sh
export OS_PROJECT_DOMAIN_NAME=default
export OS_USER_DOMAIN_NAME=default
export OS_PROJECT_NAME=admin
export OS_USERNAME=admin
export OS_PASSWORD=ADMIN_PASS
export OS_AUTH_URL=http://controller:35357/v3
export OS_IDENTITY_API_VERSION=3
export OS_IMAGE_API_VERSION=2
```
- Sau khi tạo xong, thực hiện yêu cầu token đối với user “admin” sẽ thực hiện các bước sau:
- Chạy scripts vừa tạo :
```sh
. admin-openrc
```
- Yêu cầu token và thu được kết quả sau:
```sh
openstack token issue
+------------+-----------------------------------------------------------------+
| Field      | Value                                                           |
+------------+-----------------------------------------------------------------+
| expires    | 2016-02-12T20:44:35.659723Z                                     |
| id         | gAAAAABWvjYj-Zjfg8WXFaQnUd1DMYTBVrKw4h3fIagi5NoEmh21U72SrRv2trl |
|            | JWFYhLi2_uPR31Igf6A8mH2Rw9kv_bxNo1jbLNPLGzW_u5FC7InFqx0yYtTwa1e |
|            | eq2b0f6-18KZyQhs7F3teAta143kJEWuNEYET-y7u29y0be1_64KYkM7E       |
| project_id | 343d245e850143a096806dfaefa9afdc                                |
| user_id    | ac3377633149401296f6c0d92d79dc16                                |
+------------+-----------------------------------------------------------------+
```
