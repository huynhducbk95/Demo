
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
** 

## 3. Built-in functions
- Trong Python tồn tại 2 loại hàm:
	- Hàm built-in: là các hàm được hỗ trợ bởi 
## 4. Object Oriented
- Python là ngôn ngữ hướng đối tượng, với các khái niệm chính sau:
	- `Class`: 

## 5. Iterator
###5.1. Iterable
- Iterable là các đối tượng có thể sử dụng vòng lặp `for` để duyệt quá các phần tử. ví dụ: string, dictionary, tuple, list
```sh
# string
var_a = "python"
for i in var_a :
	print (i)

# list
list_a = [1,2,3,4]
for i in list_a:
	print (i)

# dict
dict_a = {1 : "a", 2 : "b"}
for i in dict_a:
	print (i)
```
- Hoạt động duyệt qua các phần tử của các đối tượng Iterable được gọi là Iteration
###5.2. Giao thức Iteration
- Các đối tượng Iterable mặc định được cài đặt sẵn phương thức `__iter__()`. Phương thức `__iter__()` này sẽ trả về một đối tượng iterator. Đối tượng iterator này được hỗ trợ giao thức Iteration.
- Giao thức Iteration là giao thức được tạo bởi bộ 2 phương thức sau:
	- Phương thức __iter__() : trả về đối tượng iterator
	- Phương thức __next__() : trả về phần tử tiếp theo trong iterable. Nếu không có phần tử tiếp theo này thì sẽ sinh ra ngoại lệ `StopIteration`
- Để sử dụng iterator, python hỗ trợ 2 cách đó là sử dụng hàm built-in hoặc tự tạo ra đối tượng iterator thông qua định nghĩa class
- Sử dụng hàm built-in: Python cung cấp hàm `iter()` với tham số đầu vào là một đối tượng iterable và trả về một đối tượng iterator
```sh
listA = [1,2,3,4]
iterObj = iter(list)
print (iterObj.__next__())
#Output: 1
print (iterObj.__next__())
#Output: 2
print (iterObj.__next__())
#Output: 3
print (iterObj.__next__())
#Output: 4
print (iterObj.__next__())
#Output: Traceback (most recent call last):
#  		File "python", line 11, in <module>
#		StopIteration
```
- Bên cạnh hàm built-in thì chúng ta cũng có thể tự tạo ra các đối tượng iterator thông qua các class. ví dụ sau sẽ tạo ra một class `num_sequence`
```sh
class num_sequence:
	def __init__(self,n):
		self.i = 0
		self.n = n
	def __iter__(self):
		return self
	def __next__(self):
		if self.i < self.n :
			x = self.i
			self.i += 1
			return x
		else 
			raise StopIteration
```
- Tương tự như các đối tượng iterable, các Object của class `num_sequence` sẽ sử dụng phương thức `__iter__()` để tạo ra đối tượng iterator và sử dụng phương thức `__next__()` để trả về phần tử tiếp theo cho đến khi không còn phần tử tiếp theo thì sẽ sinh ra `StopIteractor` exception 
```sh
listA = num_sequence(3)
print (listA.__next__())
# Output: 0
print (listA.__next__())
# Output: 1
print (listA.__next__())
# Output: 2
print (listA.__next__())
# Output: 3
print (listA.__next__())
#Output: Traceback (most recent call last):
#  		File "python", line 10, in <module>
#		StopIteration
```
- Có một đặc điểm chung ở các ví dụ trên là các phần tử của các iterable chỉ được duyệt một lần (không thể duyệt lại được lần 2). Điều này là do mỗi iterator object chỉ có thể duyệt được 1 lần, mà trong các ví dụ trên các iterable object trả về một iterator là chính nó (có nghĩa là iterable và iterator là một).
```sh
print (list(listA))
#Output: [ 0, 1 , 2 ]
print (list(listA))
#Output: []
```
- Vì vậy, để có thể duyệt bao nhiêu lần tùy ý thì cần phải tạo iterator từ một đối tượng khác (có nghĩa là iterable và iterator không phải là một nữa). ví dụ sau sẽ tạo iterator thông qua một đối tượng khác
```sh
class num_sequence:
	def __int__(self,n):
		self.n = n
	def __iter__(self):
		return num_sequence_iter(self.n)
class num_sequence_iter:
	def __init__(self,n):
		self.i = 0 
		self.n = n
	def __iter__(self):
		return self
	def __next__():
		if self.i < self.n :
			x = self.i
			self.i += 1
			return x
		else :
			raise StopIteration
x = num_sequence(3)
print (list(x))
#Output: [0,1,2]
print (list(x))
#Output: [0,1,2]
```

## 6. Generator

## 7. Decorator

## 8. Flask Framworks
