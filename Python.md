# Tài liệu tổng quan về Python 3
## 1. Tổng quan
- Định nghĩa: Python là một ngôn ngữ lập trình bậc cao, thông dịch, hướng đối tượng, đa mục đich và cũng là ngôn ngữ lập trình động
- Giải thích cho định nghĩa trên: 
	- Python là ngôn ngữ thông dịch vì nó không phải biên dịch ra phải chạy mà dịch đến đâu thì chạy đến đó. 
	- Python là ngôn ngữ đa mục đích, tức là python không chỉ sử dụng cho lĩnh vực lập trình web mà còn được sử dụng với web, enterprise, 3D CAD,...
	- Python là ngôn ngữ lập trình đông, tức là python không cần sử dụng các kiểu dữ liệu để khai báo biến. kiểu của các biến được hiểu tự động. ví dụ : var = 1, thì biến var được hiểu là có kiểu integer
- Sau đây là một số vấn đề trong quá trình học python mà bản thân mình cho là nên chú ý

## 2. Điểm mới của Python 3
** __future__ module **
- Các phiên bản Python 3.x cung cấp thêm một số tính năng mới hoặc thay đổi cách hoạt động của một số thành phần so với python 2.x. Vì vậy, để sử dụng các thành phần mới này hay là cách hoạt động mới của các thành phần này trong python 2 cần phải import thông qua module __future__
- Ví dụ: Để thực hiện phép chia của Python 3 trong python 2, cần phải thực hiện câu lệnh `from __future__ import division` :
```sh
from __future__ import division
var = 3 / 2
print var
>> test.py
1.5
```
Nếu không sử dụng `from __future__ import division` thì kết quả là `1`
** print function **
- Hàm `print` trong có sự thay đổi khá nhiều trong Python 3. Cụ thể, dấu ngoặc đơn () là bắt buộc trong khi nó có thể không cần trong Python 2
- Ngoài ra, theo mặc định, thực hiện hàm `print` sẽ tự động xuống dòng. Trong Python 2, để ngăn cản việc xuống dòng thì phải thêm dấu `,` ở cuối lệnh hàm `print`. Còn trong Python 3, thực hiện việc này bằng cách thêm `end=' '` 
```sh
#in python 2
print "not a new line",
print "new line"
#Output: not a new line new line
#in python 3
print ("not a new line",end=' ')
print ("new line")
#Output: not a new line new line
```

** Reading input from keyboard **
- Trong Python 2, có 2 hàm được cung cấp để đọc dữ liệu từ bàn phím là `input()` và `raw_input()`. Đối với hàm `input()`, dữ liệu nhập vào sẽ được xem như là một string nếu dữ liệu được chứa trong dâu `''` hoặc `""`; ngược lại, dữ liệu được xem như là một số. Còn đối với hàm `raw_input()`, mọi dữ liệu nhập vào đều được xem như là một string 
```sh
#in python 2
var = input ("enter something: ")
print var
>> enter something: 10 
10 # it is a number
>> enter something: '10'
10 # it is a string
>> enter something: abcxyz
NameError: name 'abcxyz' is not defined

var = raw_input("enter something: ")
>> enter something: abcxyz 
abcxyz # it is a string
>> enter something: 10 
10 # it is a string
```
- Trong Python 3, hàm `raw_input()` bị loại bỏ. Trong khi đó, hàm `input()` lại xem mọi dữ liệu đều là một string (như `raw_input()` trong python 2)
```sh
var = input("enter something: ")
>> enter something: abcxyz 
abcxyz # it is a string
>> enter something: 10 
10 # it is a string
```

** integer division **
- Trong python 2, kết quả của phép chia số nguyên sẽ là phần nguyên của thương số (vd: 5/2 = 2). Để kết quả 5/2 = 2.5 thì phải tồn tại một số float trong phép chia (vd: 5.0/2 =2.5)
- Trong python 3, Kết quả của phép chia số nguyên sẽ giữ nguyên thương số. vd: 5/2 =2.5; 4/2 = 2
** Unicode representation **
- Trong python 2, để hỗ trợ ký tự Unicode thì bắt buộc phải sử dụng câu lệnh khai báo hỗ trợ unicode.
```sh
# -*- coding: utf-8 -*-
var = "so sánh giữa python 2 và python 3"
print var
>> so sánh giữa python 2 và python 3
``` 
- Trong python 3, unicode được mặc định hỗ trợ. Vậy nên, không cần quan tâm đến unicode khi sử dung Python 3

## 3. Built-in functions

## 4. Object

## 5. Iterator

## 6. Generator

## 7. Decorator

## 8. Flask Framworks
