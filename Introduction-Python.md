# Python Basic Introductiong
##1. Giới thiệu
Python là một ngôn ngữ đa dụng - thông dịch, tương tác, hướng đối tượng và là ngôn ngữ lập trình bậc cao
Python 3 được phát hành từ năm 2008. Mặc dù, phiên bản này được cho là không tương thích, nhưng sau này nhiều tính năng quan trọng của nó được được backport để có thể tương thích với phiên bản 2.7. Hướng dẫn này sẽ cung cấp đầy đủ các kiến thức về Python 3
##2. Các điểm mới ở Python 3
###2.1. thành phần `__future__`
- Như đã nói ở trên, Python 3 có các tính năng và các keyword không tương thích với Python 2. Vì vậy, để sử dụng các keyword này thì có thể import thông qua thành phần `__future__`
ví dụ: nếu muốn phép chia số nguyên của Python 3 hoạt động trong Python 2, thêm thành phần `__future__` vào lệnh `import` sau:
```sh
	from __future__ import division
```
##2.2. `Print` function
- Thay đổi đang chú ý nhất và được biết đến rộng rãi nhất trong Python 3 là các sử dụng hàm `print`. trong Python 2 thì dấu ngoặc () là tùy chọn, trong khi điều này là bắt buộc trong Python 3
- Trong Python 2, hàm `print` tự động xuống dòng và có thể ngắt xuống dòng bằng cách thêm dấu `,` ở cuối lệnh `print`. Còn trong Python 3, sử dụng `end=""`
```sh
print x, # trong Python 2, sử dụng dấu ","
print (x,end=" ") # trong Python 3, sử dụng "end=' '"
```
##2.3. Đọc dữ liệu input từ bàn phím 
- Trong Python 2, có hai hàm đọc dữ liệu từ bàn phím: `input()` và `raw_input()`. Hàm `input()` xem dữ liệu như là String nếu dữ liệu nhập vào nằm trong dấu '' hoặc "", còn lại được xem như là number
- Trong Python 3, hàm `raw_input()` bị loại bỏ. Bên cạnh đó, mọi dữ liệu nhập vào đều được xem là String 
##2.4. Phép chia số nguyên
- Trong Python 2, kết quả của phép chia 2 số nguyên là một giá trị nguyên gần kết quả chia nhất. Ví dụ, 3/2 kết quả bằng 1. Để phép chia chính xác thì cần phải chứa ít nhất một giá trị float trong phép chia như 3.0/2 hoặc 3/2.0 hoặc 3.0/2.0
- Trong Python 3, mặc định 3/2 cho kết quả là 1.5
* Chú ý: Còn nữa, nhưng mới chỉ hiểu đến đây nên chỉ đưa ra được những điểm này. Những thay đổi trong Python 3 sẽ được cập nhật sau *
##3. Cài đặt môi trường 
