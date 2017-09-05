# Rally documentation
# Table of content
- [Chương 1: Giới thiệu ](#introduction)
 - [1.1. Overview](#overview)
 - [1.2. Who is using Rally](#whouse)
 - [1.3. Use cases](#usecases)
 - [1.4. Real-life examples](#realexample)
   - [1.4.1. How does amqp_rpc_single_reply_queue affec performance](#example1)
   - [1.4.2. Performance of Nova list command](#example2)
   - [1.4.3. Complex scenario](#example3)
 - [1.5. Architecture](#architecture)
- [Chương 2: Installation](#install)
- [Chương 3: Rally step by step](#rallystepbystep)
 - [3.1. Setting up the enviroment and running a task from samples](#step1)
 - [3.2. Rally inpute task format](#step2)
 - [3.3. Running task against OpenStack with read only users](#step3)
 - [3.4. Adding success criteria (SLA) for subtasks](#step4)
 - [3.5. Rally task templates](#step5)
 - [3.6. Aborting load generation on success criteria failure](#step6)
 - [3.7. Discovering more plugins in Rally](#step7)
 - [3.8. Verifying cloud via Template verifier](#step8)
 - [3.9. Profiling Openstack Internals](#step9)

<a name='introduction'></a>
## Chương 1: Giới thiệu
<a name='overview'></a>
### 1.1. Overview
**Rally** là một công cụ kiểm thử thông dụng. Rally **tự động** và **hợp nhất** việc triển khai, xác minh, kiểm thử và ghi chép thông tin của một môi trường Openstack multi-node. Nó có thể được sử dụng như là một công cụ cơ bản cho hệ thống Openstack CI/CD (continuous integration/continuous deployment), với hệ thống này sẽ tiếp tục được cải tiến về hiệu năng và sự ổn định.

<a name='whouse'></a>
### 1.2. Who is using Rally
Đây là một tập hợp một số công ty đang sử dụng Rally để thực hiện cải tiện hiệu năng và sự ổn định cho hệ thống của họ:
![](https://rally.readthedocs.io/en/latest/_images/Rally_who_is_using.png)

<a name='usecases'></a>
### 1.3. Use cases
Dưới đây là kiến trúc high level cho 3 use case chính thức của Rally:
![](https://rally.readthedocs.io/en/latest/_images/Rally-UseCases.png)

Thông thường, có một số usecase điển hình sau mà Rally thực hiện rất tốt chức năng của nó:
- Tự động đo lường và ghi chép thông tin về cách mà những thay đổi mới ảnh hưởng đến performance của hệ thống;
- Sử dụng Rally profiler để phát hiện các vấn đề scaling và performance;
- Điều tra cách các triển khai khác nhau ảnh hưởng đến hiệu năng của hệ thống:
 - Tìm kiếm tập hợp các kiến trúc triển khai Openstack phù hợp;
 - Tạo ra các thông số kỹ thuật triển khai đối với các khối lượng tải khác nhau (Số lượng node controller, số lượng node swift,...);
- Tự động tìm kiếm phần cứng phù hợp nhất cho từng cloud Openstack cụ thể;
- Tự động tạo ra thông số kỹ thuật cho production cloud:
 - Xác định các tải đầu cuối đối với các hoạt động cơ bản trên cloud: Start/stop virtual machine, create/destroy Block Device và các API Openstack khác nhau;
 - Kiểm tra performance của các hoạt động cơ bản trên cloud trong các trường hợp tải khác nhau.

Dưới đây là những ví dụ thực tế về kiểm thử hiệu năng của hệ thống sử dụng Rally.

<a name='realexample'></a>
### 1.4. Real-life examples
<a name='example1'></a>
### 1.4.1. How does amqp_rpc_single_reply_queue affec performance?
Rally cho phép chungs ta phát hiện ra một sự thật khá thú vị về **Nova**. Chúng tôi đã sử dụng kịch bản *NovaServers.boot_and_delete* để thấy những ảnh hưởng của tùy chọn *amqp_rpc_rely_single_queue* ảnh hưởng đến thời gian bootup VM. Trước đây, chúng ta được biết rằng hiệu năng của cloud sẽ được tăng lên khi thiết lập giá trị của tùy chọn này là **on**, vì vậy chúng tôi đã quyết định kiểm tra kết quả này với Rally. Để thực hiện bài test này, chúng tôi thực hiện các request cho việc boot và delete các VM cho một số lượng lớn các người dùng đồng thời trong khoảng từ 1 đến 30 trong 2 trường hợp **có** và **không có** tùy chọn *amqp_rpc_rely_single_queue*. Đối với các nhóm người dùng khác nhau, tổng số lượng request được thực hiện là 200. Thời gian trung bình cho mỗi request được thể hiện như sau:
![](https://rally.readthedocs.io/en/latest/_images/Amqp_rpc_single_reply_queue.png)

Như thể hiện trong hình trên, đối với số lượng người dùng đồng thời trên 10 người, thì thời gian của việc boot và delete VM trong trường hợp **có** tùy chọn *amqp_rpc_rely_single_queue* sẽ chậm hơn **không có** tùy chọn này. Vậy nên, Rally đã phát hiện ra rằng việc thiết lập tùy chọn *amqp_rpc_rely_single_queue* sẽ ảnh hưởng đến hiệu năng của hệ thống nhưng theo chiều hướng ngược lại.
<a name='example2'></a>
### 1.4.2. Performance of Nova list command
Một kết quả thú vị khác đến từ kịch bản *NovaServers.boot_and_list_server*. Kịch bản này cho phép chúng ta để thực hiện các task sau sử dụng Rally:
- Task context: 1 user Openstack tạm thời.
- Task scenario: boot một VM từ người dùng trên và list ra danh sách tất cả các VM.
- Task runner: Thực hiện lại thủ tục này 200 lần theo cách liên tục.

Trong quá trình thực hiện task này, người dùng tạm thời này sẽ có ngày càng nhiều VM sau mỗi vòng lặp. Rally đã thể hiện rằng trong trường hợp này, hiệu năng của câu lệnh **VM list** trong Nova đang suy giảm nhanh hơn nhiều so với mong đợi:
![](https://rally.readthedocs.io/en/latest/_images/Rally_VM_list.png)

Như trên hình ta thấy, khi thực hiện đến lần thứ 100 trở lên, thời gian cho quá trình boot và list VM sẽ tăng lên rất nhiều.
<a name='example3'></a>
### 1.4.3. Complex scenario
Trên thực tế, phần lấn các kịch bản của Rally được thể hiện nhưng là một chuỗi các hành động nguyên tử. Ví dụ, *NovaServers.snapshot* là kịch bản bao gồm 6 hành động nguyên tử sau:
- boot VM
- snapshot VM
- delete VM
- boot VM from snapshot
- delete VM
- delete snapshot

Rally không chỉ đo lường hiệu năng của toàn bộ kịch bản, mà nó còn tính toán hiệu năng đối với từng hoạt động nguyên tử. Kết quả là, Rally hiển thị dữ liệu hiệu năng của các hoạt động nguyên tử đối với mỗi vòng lặp của kịch bản. Dữ liệu này được hiển thị trong một cách khá chi tiết:
![](https://rally.readthedocs.io/en/latest/_images/Rally_snapshot_vm.png)

<a name='architecture'></a>
### 1.5. Architecture
<a name='install'></a>
## Chương 2: Installation
Cài đặt Rally rất đơn giản. Chúng ta chỉ cần thực thi script bằng câu lệnh sau:
```
wget -q -O- https://raw.githubusercontent.com/openstack/rally/master/install_rally.sh | bash
# or using curl
curl https://raw.githubusercontent.com/openstack/rally/master/install_rally.sh | bash
```

Script này sẽ kiểm tra các package phụ thuộc đã được cài đặt trong hệ thống chưa. Nếu chạy với quyền **root** và một số package chưa được cài đặt trong hệ thống thì script sẽ hỏi bạn có muốn cài đặt các package yêu cầu không.

Sau khi kết thúc cài đặt, kiểm tra Rally đã được cài đặt thành công hay chưa bằng cách check version:
```
# rally --version
0.9.1~dev568
```
Bạn cũng cần phải set up database cho Rally sau khi cài đặt thành công. Thực hiện với câu lệnh sau:
```
#  rally-manage db recreate
```

**NOTE:** Trong khi thực hiện script có báo lỗi như sau:
```
bash: ERROR: Could not find required command 'lsb_release' in system PATH. Aborting.
Cannot uninstall requirement rally, not installed
...
```
Lỗi này là do chưa có package **redhat-lsb**. Do dó, chúng ta thực hiện câu lệnh sau:
```
# yum provides */lsb_release
# yum install redhat-lsb
```
Sau đó, thực hiện lại script bằng câu lệnh `./install_rally.sh` trong folder `rally.git` đã clone.

Như vậy là chúng ta đã cài đặt xong Rally. Tiếp theo, chúng ta sẽ đi vào tìm hiểu cách sử dụng Rally để kiểm tra hiệu năng của hệ thống Openstack.

<a name='rallystepbystep'></a>
## Chương 3: Rally step by step
Quá trình thực hiện các step yêu cầu được thực hiện trên host đã cài đặt thành công Rally. Nếu Rally chưa được cài đặt, hãy quay lại chương trước để thực hiện cài đặt Rally trước khi đi vào chương này.
<a name='step1'></a>
### 3.1. Setting up the enviroment and running a task from samples
Trong bước đầu tiên, chúng ta sẽ thực hiện các nhiệm vụ sau:
- Đăng ký hệ thống Openstack kết nối đến Rally
- Thực hiện chạy các task trong Rally
- Tạo trang phân tích kết quả

Đầu tiên, bạn phải có một triển khai Openstack trước đó để sử dụng cho mục địch kiểm thử hiệu năng. Tiếp theo, hãy đảm bảo rằng bạn đã có file xác thực keystone đối với user admin của hệ thống openstack muốn Rally kết nối đến, file này phải được copy đến host đang chạy Rally. Giả sử file xác thực có tên là `admin-openrc`

#### Đăng ký một hệ thống openstack kết nối đến Rally

Để đăng ký một triển khai Openstack đã tồn tại, chúng ta thực hiện các câu lệnh sau:
```
# . admin-openrc
# rally deployment create --fromenv --name=existing
+--------------------------------------+---------------------+----------+------------------+--------+
| uuid                                 | created_at          | name     | status           | active |
+--------------------------------------+---------------------+----------+------------------+--------+
| 9db73d44-0656-42aa-942b-f7d6399a549c | 2017-08-28T09:15:32 | existing | deploy->finished |        |
+--------------------------------------+---------------------+----------+------------------+--------+
Using deployment: 9db73d44-0656-42aa-942b-f7d6399a549c
~/.rally/openrc was updated

HINTS:

* To use standard OpenStack clients, set up your env by running:
	source ~/.rally/openrc
  OpenStack clients are now configured, e.g run:
	openstack image list
```
Cuối cùng, sử dụng câu lệnh `deployment check` để cho phép bạn xác minh rằng triển khai Openstack của bạn đã được đăng ký thành công và đã sẵn sàng để kiểm tra.
```
# rally deployment check
--------------------------------------------------------------------------------
Platform openstack:
--------------------------------------------------------------------------------

Available services:
+-------------+--------------+-----------+
| Service     | Service Type | Status    |
+-------------+--------------+-----------+
| __unknown__ | volumev2     | Available |
| cinder      | volume       | Available |
| glance      | image        | Available |
| keystone    | identity     | Available |
| neutron     | network      | Available |
| nova        | compute      | Available |
+-------------+--------------+-----------+

```

#### Thực hiện chạy các task trong Rally
Bây giờ, chúng ta đã có một hệ thống Openstack đang làm việc ổn định và đã được đăng ký và sẵn sàng để kiểm thử. Một chuỗi các task được thực hiện bởi Rally phải được xác định trong một file gọi là *task input file* (file này có thể định dạng theo JSON hoặc YAML). Hãy thử một task đơn giản có sẵn trong folder `samples/tasks/scenarios`, task này sẽ boot và delete multiple server (task input file là `samples/tasks/scenarios/nova/boot-and-delete.json`). Có nội dung như sau:
```
{
    "NovaServers.boot_and_delete_server": [
        {
            "args": {
                "flavor": {
                    "name": "m1.nano"
                },
                "image": {
                    "name": "cirros"
                },
                "force_delete": false
            },
            "runner": {
                "type": "constant",
                "times": 10,
                "concurrency": 2
            },
            "context": {
                "users": {
                    "tenants": 3,
                    "users_per_tenant": 2
                }
            }
        }
    ]
}
```
Chưa cần hiểu rõ nội dung của file này, chúng ta hãy chạy task này với câu lệnh sau (sử dụng thêm tùy chọn -v để in ra nhiều thông tin log hơn):
```
# rally task start samples/tasks/scenarios/nova/boot-and-delete.json
```
...[.TODO.]...
<a name='step2'></a>
### 3.2. Rally inpute task format
Rally chứa một tập hợp các plugin rất mạnh mẽ và trong hầu hết các trường hợp của môi trường thực tế bạn có thể sử dụng multi plugin để kiểm thử Openstack Cloud của bạn. Rally cũng có một cấu trúc rất đơn giản để chạy các testcase khác nhau được định nghĩa trong một task duy nhất. Cú pháp như sau:
```
{
    "<ScenarioName1>": [<config>, <config2>, ...]
    "<ScenarioName2>": [<config>, ...]
}
```
Với mỗi `<config>` sẽ có cú pháp như sau (là một directory):
```
{
    "args": { <scenario-specific arguments> },
    "runner": { <type of the runner and its specific parameters> },
    "context": { <contexts needed for this scenario> },
    "sla": { <different SLA configs> }
}

```

Bây giờ, chúng ta sẽ chỉnh sửa một file cấu hình từ phần trước (mà chỉ có một scenario là `NovaServers.boot_and_delete_server`) với việc thêm một scenario vào scenario đầu tiên. Như vậy là chúng ta sẽ có một configuration file với multiple subtasks trong một task duy nhất. File thu được có nội dung như sau:
```
{
    "NovaServers.boot_and_delete_server": [
        {
            "args": {
                "flavor": {
                    "name": "m1.tiny"
                },
                "image": {
                    "name": "^cirros.*-disk$"
                },
                "force_delete": false
            },
            "runner": {
                "type": "constant",
                "times": 10,
                "concurrency": 2
            },
            "context": {
                "users": {
                    "tenants": 3,
                    "users_per_tenant": 2
                }
            }
        }
    ],
    "KeystoneBasic.create_delete_user": [
        {
            "args": {},
            "runner": {
                "type": "constant",
                "times": 10,
                "concurrency": 3
            }
        }
    ]
}
```
Chúng ta có thể chạy task này như thông thường:
```
$ rally task start multiple-scenarios.json
```
Chú ý rằng, HTML task report có thể được tạo ra với câu lệnh sau:
```
$ rally task report --out=report_name.html
```
Câu lệnh này vẫn sẽ làm việc trong trường hợp một vài task không hoàn thành. Hãy nhìn vào trang report overview cho một task với multiple subtasks
```
rally task report --out=report_multiple_scenarios.html --open
```
[TODO]
Dưới đây là một ví dụ multiple configuration của cùng một scenario. Tức là bạn có thể chạy cùng một scenario trong nhiều lần với configuration khác nhau:
```
{
    "NovaServers.boot_and_delete_server": [
        {
            "args": {
                "flavor": {
                    "name": "m1.tiny"
                },
                "image": {
                    "name": "^cirros.*-disk$"
                },
                "force_delete": false
            },
            "runner": {...},
            "context": {...}
        },
        {
            "args": {
                "flavor": {
                    "name": "m1.small"
                },
                "image": {
                    "name": "^cirros.*-disk$"
                },
                "force_delete": false
            },
            "runner": {...},
            "context": {...}
        }
    ]
}
```
Và dưới đây sẽ là kết quả chạy task này và HTML report:
[TODO]

<a name='step3'></a>
### 3.3. Running task against OpenStack with read only users
Trong các phần trước, chúng ta thực hiện các task để kiểm thử môi trường Openstack  sử dụng các user tạm thời được Rally tạo ra. Việc sử dụng các user tạm thời	đối với sử dụng các user đã tồn tại trước đó có những bất lợi như sau:
- Read-only Keystone Backends: việc tạo một user tạm thời để chạy các scenario trong Rally chỉ hoạt động với Keystone backend là LDAP và AD.
- Safety: Rally có thể chạy các scenario từ một nhóm riêng biệt các user, và nếu một số lỗi xảy ra, việc này sẽ không ảnh hưởng gì đến phần còn lại của cloud.

Để đăng ký một user đã tồn tại trước đó trong Rally, bạn phải sử dụng plugin **ExistingCloud** mà ban đầu plugin này chỉ cung cấp có Rally thông tin về cloud đã tồn tại và đang hoạt động. Việc chúng ta cần làm là thêm phần *users* với thông tin của những user đã tồn tại. Dưới đây là một ví dụ về một file cấu hình có tên là *existing_users.json*:
```
{
    "type": "ExistingCloud",
    "auth_url": "http://example.net:5000/v2.0/",
    "region_name": "RegionOne",
    "endpoint_type": "public",
    "admin": {
        "username": "admin",
        "password": "pa55word",
        "tenant_name": "demo"
    },
    "users": [
        {
            "username": "b1",
            "password": "1234",
            "tenant_name": "testing"
        },
        {
            "username": "b2",
            "password": "1234",
            "tenant_name": "testing"
        }
    ]
}
```
File cấu hình này yêu cầu một số thông tin cơ bản về Openstack cloud như region name, auth url. Bên cạnh đó, thông tin về admin user và bất kỳ số lượng nào của các user đã tồn tại trước đó trong hệ thống. Rally sẽ sử dụng thông tin của các user này để tạo ra các load trong cho các testing ngay khi chúng được đăng ký. Đăng ký sẽ sử dụng cú pháp sau:
```
$ rally deployment create --file existing_users --name our_loud
[TODO]
```
Sau khi đăng ký xong deployment mới này, Rally sẽ sử dụng các user đang tồn tại thay vì tạo ra các user khi chạy các task.

Bây giờ, chúng ta sẽ chạy các task sử dụng các user đã đăng ký. Như trước tiên, đừng quên xóa `users` trong phần `context` của file input nếu bạn muốn sử dụng những user đang tồn tại. Dưới đây là một ví dụ về file (boot-and-delete.json):
```
{
    "NovaServers.boot_and_delete_server": [
        {
            "args": {
                "flavor": {
                    "name": "m1.tiny"
                },
                "image": {
                    "name": "^cirros.*-disk$"
                },
                "force_delete": false
            },
            "runner": {
                "type": "constant",
                "times": 10,
                "concurrency": 2
            },
            "context": {}
        }
    ]
}
```
Khi chạy task này, Rally sẽ sử dụng user `b1` và `b2` để chạy các task thay vì tạo ra các user tạm thời:
```
$ rally task start samples/task/scenarios/nova/boot-and-delete.json
```
<a name='step4'></a>
### 3.4. Adding success criteria (SLA) for subtasks
Rally cho phép chúng ta thiết lập tiêu chí thành công ( được gọi là SLA - viết tắt của từ Service-level Agreement ) đối với mỗi subtask. Rally sẽ tự động kiểm tra tiêu chí thành công cho bạn.

Để cấu hình SLA, chỉ cần thêm phần `sla` đến cấu hình của mỗi subtask tương ứng. Bạn cũng có thể kết hợp nhiều tiêu chí khác nhau:
```
{
    "NovaServers.boot_and_delete_server": [
        {
            "args": {
                ...
            },
            "runner": {
                ...
            },
            "context": {
                ...
            },
            "sla": {
                "max_seconds_per_iteration": 10,
                "failure_rate": {
                    "max": 25
                }
            }
        }
    ]
}
```
Đối với file cấu hình trên, Rally sẽ xem scenario `NovaServers.boot_and_delete_server` không thành công nếu thời gian thực hiện mỗi interation là hơn 10 giây hoặc nếu hơn 25 % interation bị lỗi.

### Checking SLA
Chúng ta sẽ xem xét cách Rally SLA làm việc như thế nào, sử dụng một ví dụ đơn giản dựa trên **Dummy scenarios**. Những scenario này rất hữu ích cho việc testing các hành động của Rally. Bây giờ, chúng ta sẽ tạo ra một task mới, `test-sla.json`, chứa 2 scenario: một là không làm gì và hai là đi vào một exception:
```
{
    "Dummy.dummy": [
        {
            "args": {},
            "runner": {
                "type": "constant",
                "times": 5,
                "concurrency": 2
            },
            "context": {
                "users": {
                    "tenants": 3,
                    "users_per_tenant": 2
                }
            },
            "sla": {
                "failure_rate": {"max": 0.0}
            }
        }
    ],
    "Dummy.dummy_exception": [
        {
            "args": {},
            "runner": {
                "type": "constant",
                "times": 5,
                "concurrency": 2
            },
            "context": {
                "users": {
                    "tenants": 3,
                    "users_per_tenant": 2
                }
            },
            "sla": {
                "failure_rate": {"max": 0.0}
            }
        }
    ]
}
```
Tất cả các scenario trong những task này có `maximum failure rate of 0%` như là tiêu chí thành công của chúng. Chúng ta hy vọng rằng, scenario đầu tiên sẽ vượt qua tiêu chí này trong khi scenario thứ 2 sẽ bị lỗi. Thực hiện task này với câu lệnh sau:
```
$ rally task start test-sla.json
[TODO]
```
Sau khi hoàn thành, thực hiện câu lệnh để kiểm tra kết quả với tiêu chí thành công mà bạn đã định nghĩa trong task:
```
$ rally task sla_check
[TODO]
```
Chúng ta cũng có thể kiểm tra tiêu chí thành công sử dụng giao diện của task report.

Success criteria là một tính năng rất hữu ích, cho phép chúng ta không chỉ phân tích kết quả của các task, mà nó cũng sử dụng để điều khiển việc thực thi của các task. Tiếp theo, chúng ta sẽ tìm hiểu về cách sử dụng SLA để hủy bỏ việc tạo ra load trước khi Openstack gặp lỗi.

<a name='step5'></a>
### 3.5. Rally task templates
Một tính năng khác của định dang task trong Rally là Rally hỗ trợ **template syntax** dựa trên jinja2. Việc này trở nên rất hữu ích khi chúng ta có một cấu trúc task cố định và muốn tham số hóa task này trong một số cách. Ví dụ, chúng ta có một input task file là `task.yaml` chạy một tập các scenario của Nova:
```
---
  NovaServers.boot_and_delete_server:
    -
      args:
        flavor:
            name: "m1.tiny"
        image:
            name: "^cirros.*-disk$"
      runner:
        type: "constant"
        times: 2
        concurrency: 1
      context:
        users:
          tenants: 1
          users_per_tenant: 1

  NovaServers.resize_server:
    -
      args:
        flavor:
            name: "m1.tiny"
        image:
            name: "^cirros.*-disk$"
        to_flavor:
            name: "m1.small"
      runner:
        type: "constant"
        times: 3
        concurrency: 1
      context:
        users:
          tenants: 1
          users_per_tenant: 1
```
Trong các scenario trên, `^ciross.-disk$` được truyền đến scenario như là một tham số, có nghĩa là các scenario này sẽ sử dụng một image thích hợp khi boot server. Bây giờ, chúng ta có một tập các scenario có cùng runner/context/sla, nhưng chúng ta muốn chạy trên các image khác nhau để so sánh hiệu năng. Giải pháp hợp lý nhất là cung cấp tên image vào một template variable:
```
---
  NovaServers.boot_and_delete_server:
    -
      args:
        flavor:
            name: "m1.tiny"
        image:
            name: {{image_name}}
      runner:
        type: "constant"
        times: 2
        concurrency: 1
      context:
        users:
          tenants: 1
          users_per_tenant: 1

  NovaServers.resize_server:
    -
      args:
        flavor:
            name: "m1.tiny"
        image:
            name: {{image_name}}
        to_flavor:
            name: "m1.small"
      runner:
        type: "constant"
        times: 3
        concurrency: 1
      context:
        users:
          tenants: 1
          users_per_tenant: 1
```
Và sau đó truyền giá trị của biến `{{image_name}}` khi bắt đầu chạy file này. Để truyền giá trị cho tham số, Rally cung cấp những cách sau:
- Truyền giá trị trực tiếp qua command line với cú pháp là dictionary của YAML hoặc JSON:
```
$ rally task start task.yaml --task-args '{"image_name": "^cirros.*-disk$"}'
$ rally task start task.yaml --task-args 'image_name: "^cirros.*-disk$"'
```
- Ánh xạ đến một file khai báo giá trị cho tham số:
```
$ rally task start task.yaml --task-args-file args.json
$ rally task start task.yaml --task-args-file args.yaml
```
với nội dung của variable file có cú pháp của JSON hoặc YAML:`
```
  args.yaml

  ---
  image_name: "^cirros.*-disk$"
```
```
  args.json

  {
  	"image_name": "^cirros.*-disk$"
  }
```

### Sử dụng các giá trị default
Jinja 2 template cho phép thiết lập các giá trị default cho các tham số. Với giá trị default này, task của bạn sẽ làm việc cho dùng bạn không cung cấp giá trị khi bắt đầu thực thi. Cú pháp như sau:
```
    {% set image_name = image_name or "^cirros.*-disk$" %}
    ---

      NovaServers.boot_and_delete_server:
        -
          args:
            flavor:
                name: "m1.tiny"
            image:
                name: {{image_name}}
          runner:
            type: "constant"
            times: 2
            concurrency: 1
          context:
            users:
              tenants: 1
              users_per_tenant: 1

    	...
```
Nếu không truyền gía trị cho tham số, thì giá trị default sẽ được sử dụng.

Bên cạnh đó, dó sử dụng Jinja2 template nên chúng ta cũng có thể sử dụng các tính năng nâng cao trong jinja2. Ví dụ sau sử dụng vòng lặp trong input task file:
```
---
  KeystoneBasic.create_user:
  {% for i in range(2, 11, 2) %}
    -
      args: {}
      runner:
        type: "constant"
        times: 10
        concurrency: {{i}}
      sla:
        failure_rate:
          max: 0
  {% endfor %}
```

<a name='step6'></a>
### 3.6. Aborting load generation on success criteria failure
Testing các pre-production và production Openstack cloud không phải là một nhiệm vụ đơn giản. Một mặt, nó rất khó để có thể đạt được giới hạn của Cloud, mặt khác, cloud không bị nguy hiểm. Đấy là trong môi trường production. Rally nhằm mục đích làm cho việc này đăng giản nhất có thể. Từ khi bắt đầu, Rally đã có khả năng tạo ra đủ số lượng load cho mọi Openstack cloud. Việc tạo ra số lượng lớn load lớn cũng là vấn đề chính cho các Openstack cloud, vì Rally không biết như thế nào để dừng load lại cho đến khi việc dừng load đã quá muộn.

Với tính năng **stop on SLA failure**, mọi việc trở nên đơn giản hơn.

Tính năng này có thể dễ dàng được kiểm thử trong thế giới thực bằng cách chạy một trong các scenario quan trọng đó là *Authenticate.keystone*. Scenario chỉ cố gắng xác thực từ các user mà đã được tạo trước đó bởi Rally. File input cho task này như sau:
```
---
  Authenticate.keystone:
  -
    runner:
      type: "rps"
      times: 6000
      rps: 50
    context:
      users:
        tenants: 5
        users_per_tenant: 10
    sla:
      max_avg_duration: 5
```
Nội dung của file này là: tạo ra 5 tenants với 10 user trong mỗi tenants, sau đó thử xác thực đến keystone 6000 lần. Thực hiện 50 lần xác thực trên 1 giây (có nghĩa là mỗi request sẽ được gọi sau mỗi 20 ms). Mỗi lần xác thực là chúng ta đang thực hiện xác thực từ một user đã được tạo ra bởi Rally. Task này chỉ được hoàn thành chỉ khi thời gian trung bình tối đa cho việc xác thực là bé hơn 5 giây.

Chú ý rằng bài test này khá nguy hiểm bởi vì nó có thể ảnh hưởng đến Keystone. Chúng ta đang chạy đồng thời nhiều request authentication và một số thứ sẽ bị lỗi nếu không được thiết lập chính xác (ví dụ như triển khai Openstack thông qua Destack trên VM yếu)

Chạy task này với một tham số cho biết Rally sẽ dừng việc load nếu SLA bị fail:
```
$ rally task start --abort-on-sla-failure auth.yaml
....
+--------+-----------+-----------+-----------+---------------+---------------+---------+-------+
| action | min (sec) | avg (sec) | max (sec) | 90 percentile | 95 percentile | success | count |
+--------+-----------+-----------+-----------+---------------+---------------+---------+-------+
| total  | 0.108     | 8.58      | 65.97     | 19.782        | 26.125        | 100.0%  | 2495  |
+--------+-----------+-----------+-----------+---------------+---------------+---------+-------+
```
Nhìn vào bảng kết quả trên, chúng ta phát hiện thấy 2 điều khá thú vị:
- Thời gian thực hiện trung bình là 8.58 giây, lớn hơn 5 giây.
- Rally chỉ thực hiện 2495 (thay vì 6000) yêu cầu authentication.

Để hiểu hơn những gì đã xảy ra, hãy tạo ra file html report:
```
rally task report --out auth_report.html
```
![](https://rally.readthedocs.io/en/latest/_images/Report-Abort-on-SLA-task-1.png)

Trên biểu đồ thể hiện thời gian thực hiện cho mỗi vòng lặp, chúng ta có thể quan sát thấy thời gian của request xác thực đạt đến 65 giây tại lần tạo load cuối cùng. Rally đã ngừng tạo load tại thời điểm cuối cùng ngay trước khi điều tồi tệ xảy ra. Lý do tại sao Rally cố gắng chạy rất nhiều xác thực là bởi vì nó không đủ tiêu chuẩn SLA. Đến khi nào đủ SLA (thời gian trung bình trên 5s) hoặc đạt được yêu cầu là 6000 lần thì Rally mới dừng việc tạo load. Chúng ta sẽ tạo ra một SLA tốt hơn và thực hiện chạy lại một lần nữa:
```
---
  Authenticate.keystone:
  -
    runner:
      type: "rps"
      times: 6000
      rps: 50
    context:
      users:
        tenants: 5
        users_per_tenant: 10
    sla:
      max_avg_duration: 5
      max_seconds_per_iteration: 10
      failure_rate:
        max: 0
```
Bây giờ, chúng ta có thêm các thông tin SLA sau:
- Thời gian trung bình tối đa cho các lần chạy là dưới 5s
- Thời gian chạy cho 1 lần xác thực là dưới 10s
- Không có lỗi xác thực nào xuất hiện

Thực hiện chạy task này:
```
$ rally task start --abort-on-sla-failure auth.yaml

...
+--------+-----------+-----------+-----------+---------------+---------------+---------+-------+
| action | min (sec) | avg (sec) | max (sec) | 90 percentile | 95 percentile | success | count |
+--------+-----------+-----------+-----------+---------------+---------------+---------+-------+
| total  | 0.082     | 5.411     | 22.081    | 10.848        | 14.595        | 100.0%  | 1410  |
+--------+-----------+-----------+-----------+---------------+---------------+---------+-------+
```
![](https://rally.readthedocs.io/en/latest/_images/Report-Abort-on-SLA-task-2.png)

Trong lần chạy này, Rally đã ngừng tạo load sau 1410 vòng lặp. Tuy nhiên, chúng ta có thể quan sát trên biểu đồ, vòng lặp mà thời gian thực hiện trên 10s là khoảng 950 (chẳng hạn là request thứ 950). Vậy, tại sao Rally vẫn thực hiện thêm 500 request sau đó? Nguyên nhân là do trong quá trình thực thi request 950, trong quá trình đợi phản hồi, Rally lại đã tạo ra khoảng 50 request/s * 10s = 500 request. Do vậy, khi nhận được phản hồi của request 950 thì Rally mới biết được thời gian là trên 10s. Rally sẽ dừng tạo ra load và đợi các phản hồi còn lại trả về.

Trên đây, chúng ta đã tìm hiểu khá nhiều về Rally. Tuy nhiên, chúng ta mới chỉ sử dụng một vài plugin đơn giản để phục vụ cho mục đích tìm hiểu Rally. Tiếp theo, chúng ta sẽ khám phá nhiều hơn nữa các plugin trong Rally.

<a name='step8'></a>
### 3.8. Verifying cloud via Template verifier
Hiên nay, Rally hỗ trợ một tập hợp rất đa dạng các plugin mà sử dụng API của các project Openstack khác nhau như **Keystone**, **Nova**, **Cinder**, **Glance**,... Hơn nữa, bạn có thể kết hợp nhiều plugin trong một task để kiểm thử cloud của bạn một cách toàn diện.

Để thấy được danh sách các plugin có sẵn trong Rally. Chúng ta có thể sử dụng câu lệnh sau để list ra danh sách các plugin và show chi tiết thông tin về chúng:
```
$ rally plugin show create_meter_and_get_stats

NAME
    CeilometerStats.create_meter_and_get_stats
NAMESPACE
    default
MODULE
    rally.plugins.openstack.scenarios.ceilometer.stats
DESCRIPTION
    Meter is first created and then statistics is fetched for the same
    using GET /v2/meters/(meter_name)/statistics.
PARAMETERS
+--------+------------------------------------------------+
| name   | description                                    |
+--------+------------------------------------------------+
| kwargs | contains optional arguments to create a meter |
|        |                                                |
+--------+------------------------------------------------+
```

Trong trường hợp tìm thấy nhiều plugin, tất các plugin trùng với từ khóa sẽ được list ra:
```
$ rally plugin show NovaKeypair

Multiple plugins found:
+-------------------------------------------------+-----------+-------------------------------------------------------+
| name                                            | namespace | title                                                 |
+-------------------------------------------------+-----------+-------------------------------------------------------+
| NovaKeypair.boot_and_delete_server_with_keypair | default   | Boot and delete server with keypair.                  |
| NovaKeypair.create_and_delete_keypair           | default   | Create a keypair with random name and delete keypair. |
| NovaKeypair.create_and_list_keypairs            | default   | Create a keypair with random name and list keypairs.  |
+-------------------------------------------------+-----------+-------------------------------------------------------+
```

Ngoài ra, câu lệnh sau có thể được sử dụng để list ra danh sách các plugin theo tên:
```
$ rally plugin list --name Keystone

+--------------------------------------------------+-----------+-----------------------------------------------------------------+
| name                                             | namespace | title                                                           |
+--------------------------------------------------+-----------+-----------------------------------------------------------------+
| Authenticate.keystone                            | default   | Check Keystone Client.                                          |
| KeystoneBasic.add_and_remove_user_role           | default   | Create a user role add to a user and disassociate.              |
| KeystoneBasic.create_add_and_list_user_roles     | default   | Create user role, add it and list user roles for given user.    |
| KeystoneBasic.create_and_delete_ec2credential    | default   | Create and delete keystone ec2-credential.                      |
| KeystoneBasic.create_and_delete_role             | default   | Create a user role and delete it.                               |
| KeystoneBasic.create_and_delete_service          | default   | Create and delete service.                                      |
| KeystoneBasic.create_and_list_ec2credentials     | default   | Create and List all keystone ec2-credentials.                   |
| KeystoneBasic.create_and_list_services           | default   | Create and list services.                                       |
| KeystoneBasic.create_and_list_tenants            | default   | Create a keystone tenant with random name and list all tenants. |
| KeystoneBasic.create_and_list_users              | default   | Create a keystone user with random name and list all users.     |
| KeystoneBasic.create_delete_user                 | default   | Create a keystone user with random name and then delete it.     |
| KeystoneBasic.create_tenant                      | default   | Create a keystone tenant with random name.                      |
| KeystoneBasic.create_tenant_with_users           | default   | Create a keystone tenant and several users belonging to it.     |
| KeystoneBasic.create_update_and_delete_tenant    | default   | Create, update and delete tenant.                               |
| KeystoneBasic.create_user                        | default   | Create a keystone user with random name.                        |
| KeystoneBasic.create_user_set_enabled_and_delete | default   | Create a keystone user, enable or disable it, and delete it.    |
| KeystoneBasic.create_user_update_password        | default   | Create user and update password for that user.                  |
| KeystoneBasic.get_entities                       | default   | Get instance of a tenant, user, role and service by id's.       |
+--------------------------------------------------+-----------+-----------------------------------------------------------------+
```
