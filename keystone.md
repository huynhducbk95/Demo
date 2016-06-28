# Identity Service
# Mục lục
<h4><a href="#tong_quan">1.	Giới thiệu tổng quan</a></h4>
<ul>
<li><a href="#tq_khaiNiem">1.1. Các khái niệm</a>
<ul>
  <li><a href="#khaiNiem_project">1.1.1.	Project</a></li>
  <li><a href="#khaiNiem_domain">1.1.2.	Domain</a></li>
  <li><a href="#khaiNiem_user_group">1.1.3.	User và User Group (Actor)</a></li>
  <li><a href="#khaiNiem_role">1.1.4.	Role</a></li>
  <li><a href="#khaiNiem_token">1.1.5.	Token</a></li>
  <li><a href="#khaiNiem_catalog">1.1.6.	Catalog</a></li>
</ul>
</li>
<li><a href="#tq_identity">1.2.	Identity</a>
<ul>
  <li><a href="#iden_sql">1.2.1.	SQL</a></li>
  <li><a href="#iden_ldap">1.2.2.	LDAP</a></li>
  <li><a href="#iden_backends">1.2.3.	Multiple Backend</a></li>
  <li><a href="#iden_provider">1.2.4.	Identity Provider</a></li>
  <li><a href="#iden_usecase_backend">1.2.5.	Các trường hợp sử dụng các Identity backend</a></li>
</ul>
</li>
<li><a href="#tq_Authentication">1.3.	Authentication</a>
<ul>
  <li><a href="#authen_pass">1.3.1.	Password</a></li>
  <li><a href="#authen_token">1.3.2.	Token</a></li>
</ul>
</li>
<li><a href="#tq_author">1.4.	Access Management và Authorization</a></li>
<li><a href="#tq_format">1.5.	Các định dạng Token</a>
<ul>
  <li><a href="#format_uuid">1.5.1.	UUID	</a></li>
  <li><a href="#format_pki">1.5.2.	PKI – PKIZ</a></li>
  <li><a href="#format_fernet">1.5.3.	Fernet</a></li>
</ul>
</li>
<li><a href="#tq_activity">1.6.	Hoạt động của Keystone</a></li>
</ul>
<h4><a href="#install_config">2.	Cấu hình và cài đặt Keystone</a></h4>
----

<h2><a name="tong_quan">1.	Giới thiệu tổng quan</a></h2>
&emsp;Keystone là dịch vụ xác thực của OpenStack – cung cấp quyền truy cập đảm bảo đã được kiểm soát đến tài nguyên của một cloud. Trong môi trường OpenStack, Keystone thực hiện nhiều chức năng quan trọng, như xác thực người dùng và xác định những tài liệu nào người dùng được quyền truy cập đến.</br>
&emsp;Để hiểu rõ cách Keystone cung cấp truy cập an toàn và được kiểm soát đến các tài nguyên, chúng ta cần xem xét các tính năng cơ bản của Keystone:</br>
<b>Indentity</b></br>
&emsp;Identity là định danh của người đang truy cập các tài nguyên cloud. Trong OpenStack keystone, identity thường đại diện cho một người dùng (user). Trong triển khai đơn giản nhất, identity của user có thể được lưu trữ trong database của Keystone. Nhưng trong môi trường sản xuất hay trong môi trường doanh nghiệp, một Identity Provider bên ngoài thường được sử dụng. Ví dụ như Manager Identity Federated Tivoli của IBM. Keystone có thể lấy ra thông tin định danh của người dùng từ các Provider Identity bên ngoài này.</br>
<b>Authentication</b></br>
&emsp;Authentication là quá trình của việc xác minh một thông tin định danh của người dùng. Một định danh người dùng đầu tiên sẽ được xác thực thông qua một password, sau đó các thông tin này sẽ được sử dụng để tạo ra một token để sử dụng các lần xác thực tiếp theo. Việc này sẽ làm giảm số lượng lần hiển thị và tiếp xúc với password (password được ẩn giấu và bảo vệ các nhiều càng tốt). Token cũng có giá trị trong một thời gian giới hạn (Việc này làm giảm khả năng sử dụng của nó trong trường hợp bị trộm). Trong OpenStack, Keystone là dịch vụ duy nhất có thể tạo ra token. </br>
&emsp;Hiện nay, Keystone sử dụng một dạng token được gọi là bearer token. Cụ thể, bất kỳ ai nắm quyền sở hữu token, cho dù là đúng hay là sai (vd: kẻ trộm,…) thì đều có khả năng sử dụng thẻ token để xác thực và truy cập đến các tài nguyên. Do đó, khi sử dung Keystone thì việc bảo vệ token là rất quan trọng.</br>
<b>Access Management (Authorication)</b></br>
&emsp;Access Management hay Authorication là quá trình xác định những tài nguyên nào một người dùng có thể truy cập.</br>
<b>các tính năng của Keystone</b></br>
&emsp;Trong khi Keystone tập trung hầu hết vào cung cấp các dịch vụ Identity, Authentication và Access Management, nó cũng hỗ trợ một số tính năng khác cho môi trường OpenStack:</br>
<ul>
<li>Xác thực đơn và cấp quyền cho các dịch vụ khác của OpenStack</li>
<li>Xử lý các hệ thống xác thực ngoài và cô lập tất cả các dịch vụ trong OpenStack</li>
<li>Keystone cung cấp các Project giúp các dịch vụ khác của OpenStack có thể sử dụng để phân biệt các tài nguyên (ví dụ như các máy chủ, các image,…).</li>
<li>Keystone cung cấp các Domain được sử dụng để định nghĩa name-space của các user, group và project để cho phép phân biệt giữa các người dùng</li>
<li>Cung cấp việc đăng ký các Roles được sử dụng cho việc cấp phép giữa Keystone và file policy của mỗi dịch vụ OpenStack</li>
<li>Cung cấp một catalog lưu trữ các dịch vụ OpenStack, endpoint và region, cho phép client có thể tìm kiếm các dịch vụ hoặc các endpoint mà họ cần.</li>
</ul>
<h3><a name="tq_khaiNiem">1.1.	Các khái niệm </a></h3></br>
&emsp;Để có thể tìm hiểu Keystone, trước tiên cần phải hiểu các khái niệm được sử dụng trong Keystone.</br>
<h3><a name="khaiNiem_project">1.1.1.	 Project </a></h3></br>
&emsp;Trong Keystone, Project là khái niệm trừu tượng được sử dụng bởi các dịch vụ OpenStack để nhóm và phân biệt các tài nguyên (vd: các server, các image,…)</br>
&emsp;Trước đây, các Project Keystone sử dụng khái niệm “tenant”, nhưng do trực quan hơn nên đã đổi sang “Project”. Khái niệm này phù hợp hơn để nói về mục tiêu cơ bản nhất của Keystone là cung cấp các project và trình bày ai là được phép truy cập đến các project này.</br>
&emsp;Người dùng và nhóm người dùng nhận quyền truy cập đến một project sử dụng một khái niệm là Role Assignment (phân công). Một Role được gán cho một user hoặc user group trong một Project cho biết user hoặc user group có một số quyền truy cập đến các tài nguyên trong Project.</br>
&emsp;Ví dụ:</br>
-	Một người có thể thuộc nhiều project và có các quyền khác nhau.</br>
-	“Alice” có quyền admin trong project “abc” nhưng chỉ có quyền user trong project “xyz”</br>
