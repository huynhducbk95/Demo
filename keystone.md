<h1>Identity Service</h1>
<h1>Mục lục</h1>

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
<h3><a name="khaiNiem_domain">1.1.2.	 Domain</a></h3></br>
&emsp; Trong giao đoạn đầu của OpenStack, không có cơ chế để hạn chế tầm nhìn của các project trong các tổ chức người dùng khác nhau. Điều này dẫn đến nhưng va chạm về tên Project của các tổ chức khác nhau. Tên user cũng có tầm nhìn tổng thể nên cũng có thể dẫn đến những va chạm không mong muốn khi 2 tổ chức đều có chung một tên user. Keystone đã đưa ra khái niệm là Domain.</br>
&emsp; Domain cung cấp khả năng để cô lập tầm nhìn của một tập các Project và user (và group) trong một tổ chức cụ thể. Một Domain được định nghĩa như là một tập hợp bao gồm các user, các group và các project.</br>
<h3><a name="khaiNiem_user_group">1.1.3.	 User và User Group (Actor)</a></h3></br>
&emsp;Trong Keystone, user và user group là các thực thể được cấp quyền truy cập đến các tài nguyên trong các project. Group là một tập hợp của nhiều user. User là đại diện cho một người, hay một dịch vụ sử dụng các dịch vụ OpenStack và được chứa trong một Domain cụ thể.</br>
&emsp;Mối quan hệ của Domain, project, user và group được thể hiện trong hình sau:</br>
<img src="image/relationship.png"/><br><br>
&emsp;Các user, group và project luôn luôn nằm trong phạm vi của Domain. Điều này dẫn đến, một tên của user hay groups hay project có thể được sử dụng trên các Domain khác nhau. Ví dụ như user “Alice” hoặc groups “Adminstrator” đều có ở cả IBM và Acme Inc.</br>
<h3><a name="khaiNiem_role">1.1.4.	 Role</a></h3></br>
&emsp;Role được sử dụng trong Keystone để xác định những quyền mà môt user hay group có thể thực hiện với một tài nguyên OpenStack.</br>
&emsp;Ví dụ, Role admin được gán cho user “Alice” đối với project “Development”. Khi đó, user “Alice” sẽ thực hiện được các hành động của quyền admin đối với các tài nguyên của project “Development”</br>
<h3><a name="khaiNiem_token">1.1.5.	 Token</a></h3></br>
&emsp;Khi người dùng gọi đến bất kỳ một API OpenStack thì họ phải chứng minh được rằng họ là ai và họ phải được cho phép để gọi đến các API. Thực hiện việc này bằng cách truyền một token OpenStack vào trong lời gọi API. Keystone là dịch vụ duy nhất chịu trách nhiệm tạo ra token. Người dùng nhận một token khi xác thực thành công với Keystone. Token chứa quyền của một user trong cloud. Nó bao gồm một ID và một payload. ID đảm bảo tính duy nhất của token trên mỗi cloud và payload chứa dữ liệu về người dùng.</br>
&emsp;Ví dụ: một token sẽ chứa nhiều trường thể hiện các thuộc tính Identity và Authorization về một user trong một project.</br>
 <img src="image/relationship/exTokenV3.png"/><br><br>
&emsp;Token trên chứa những thông tin sau: Khi nào token được tạo ra; Khi nào token hết hạn, user nào đã được xác thực- do đó, được phép sử dụng token này; xác định project nào token này có giá trị; Và cuối cùng là Catalog chứa các dịch vụ trong OpenStack.</br>
<h3><a name="khaiNiem_catalog">1.1.6.	 Catalog</a></h3></br>
&emsp;Catalog là danh mục chứa các URL và các endpoint của các dịch vụ OpenStack khác nhau. Nó rất cần thiết cho OpenStack, thiếu catalog thì các user, và các ứng dụng sẽ không biết địa chỉ để gửi request tạo một máy ảo hoặc là lưu trữ một đối tượng.<//br>
&emsp;Catalog được chứa các endpoint và mỗi endpoints chứa một admin URL, enternal URL và public URL.</br>
&emsp;Ví dụ về một Catalog chỉ chứa hai dịch vụ Object Storage và Identity</br>
  <img src="image/relationship/exCatolog.png"/><br><br>
&emsp;Trên đây là các khái niệm trong OpenStack, tiếp theo sẽ đi vào chi tiết các tính năng của Keystone.</br>
<h3><a name="tq_identity">1.2.	Identity</a></h3></br>
&emsp;Dịch vụ Identity trong Keystone cung cấp các Actor (user hay group). Identity trong Openstack có thể đến từ các vị trí khác nhau như SQL, LDAP hay Federated Identity Provider.</br>
<h3><a name="iden_sql">1.2.1. SQL</a></h3></br>
&emsp;Keystone hỗ trợ các database để lưu trữ các actor như MySQL, PostgreSQL hay DB2. Keystone sẽ lưu trữ các thông tin của người dùng như tên, password và mô tả. </br>
&emsp;Về cơ bản, Keystone hoạt động như một Identity Provider như chắc chắn rằng sẽ không phải là một giải pháp tốt ưu trong một số trường hợp như trong môi trường doanh nghiệp.</br>
&emsp;Các ưu, nhược điểm khi sử dụng SQL:</br>
<ul>
    <li>Ưu điểm:
        <ul>
            <li>Dễ dàng cài đặt</li>
            <li>Quản lý user và group thông qua các API OpenStack</li>
        </ul>
    </li>
    <li>Nhược điểm:
        <ul>
            <li>Keystone không phải là một Identity Provider</li>
            <li>Hỗ trợ password yếu: Không luân chuyển password và không khôi phục password</li>
            <li>Hầu hết các doanh nghiệp sử dụng LDAP</li>
        </ul>
    </li>
</ul>
<h3><a name="iden_ldap">1.2.2.	 LDAP</a></h3></br>	
&emsp;Keystone cũng có một tùy chọn để lưu trữ và lấy dữ liệu actor trong Lightweight Directory Access Protocol (LDAP). Keystone sẽ truy cập đến LDAP như các ứng dụng khác sử dụng LDAP (như Email, Web application,…). Thiết lập kết nối đến LDAP trong file cấu hình Keystone. </br>	
&emsp;LDAP thường chỉ thực hiện quyền đọc, chẳng hạn như tìm kiếm user (thông qua search) và xác thực (thông qua bind).</br>	
&emsp;Ưu, nhược điểm khi sử dụng LDAP:</br>	
<ul>
    <li>Ưu điểm:
        <ul>
            <li>Không duy trì bản sao của tài khoản user</li>
            <li>Keystone hoạt động như Identity Provider (nhà cung cấp nhận dạng).</li>
        </ul>
    </li>
    <li>Nhược điểm:
        <ul>
            <li>Các tài khoản của các dịch vụ khác trong OpenStack cũng cần được lưu trữ ở đâu đó, và admin LDAP không muốn lưu các tài khoản này trong LDAP</li>
            <li>Keystone vẫn thấy được password của user, khi password nằm trong một yêu cầu xác thực. Keystone đơn giản chỉ chuyển các yêu cầu, vì vậy không cần thiết phải biết password của user</li>
        </ul>
    </li>
</ul>
<h3><a name="iden_backends">1.2.3. Multiple Backend</a></h3></br>
&emsp;Keystone hỗ trợ sử dụng multiple backend, nghĩa là mỗi domain có thể sử dụng một backend</br>
&emsp;Ví dụ: Trong ví dụ sau, Identity sử dụng LDAP cho Domain A và Domain B, một SQL để lưu trữ các service account và các Assignment</br>
<img src="image/relationship/multiple_backend.png"/><br><br>
&emsp;Ưu, nhược điểm khi sử dụng multiple backend:</br>
<ul>
    <li>Ưu điểm:
        <ul>
            <li>Hỗ trợ đồng thời nhiều backend</li>
            <li>Có thể sử dụng lại các LDAP đã có</li>
        </ul>
    </li>
    <li>Nhược điểm:
        <ul>
            <li>Cài đặt khá phức tạp</li>
            <li>Xác thực người dùng bắt buộc phải nằm trong phạm vi Domain</li>
        </ul>
    </li>
</ul>
