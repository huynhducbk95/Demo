
<h1> Tài liệu tổng quan về Python 3 </h1></br>

<h4><a href="#dinh_nghia">1.	Định nghĩa</a></h4>
<h4><a href="#new">2.	Điểm mới của Python 3</a></h4>
<h4><a href="#object">3. Object</a></h4>
<h4><a href="#iterator">4. Iterator</a>
<ul>
	<li><a href="#iterable">4.1. Iterable</a></li>
	<li><a href="#protocol_iter">4.2. Giao thức Iteration</a></li>
</ul>
</h4>
<h4><a href="#generator">5. Generator</a></h4>
<h4><a href="#decorator">6. Decorator</a>
<ul>
	<li><a href="#function">6.1. Function</a></li>
	<li><a href="#func_decorator">6.2. Function Decorator</a></li>
	<li><a href="#class_decorator">6.3. Class Decorator</a></li>
</ul>
</h4>

------

<h2><a name="dinh_nghia">1.	Định nghĩa</a></h2>
- Định nghĩa: Python là một ngôn ngữ lập trình bậc cao, thông dịch, hướng đối tượng, đa mục đich và cũng là ngôn ngữ lập trình động
- Giải thích cho định nghĩa trên: 
	- Python là ngôn ngữ thông dịch vì nó không phải biên dịch ra phải chạy mà dịch đến đâu thì chạy đến đó. 
	- Python là ngôn ngữ đa mục đích, tức là python không chỉ sử dụng cho lĩnh vực lập trình web mà còn được sử dụng với web, enterprise, 3D CAD,...
	- Python là ngôn ngữ lập trình đông, tức là python không cần sử dụng các kiểu dữ liệu để khai báo biến. kiểu của các biến được hiểu tự động. ví dụ : var = 1, thì biến var được hiểu là có kiểu integer

<h2><a name="new">2.	Điểm mới của Python 3</a></h2>
### __future__ module
- Các phiên bản Python 3.x cung cấp thêm một số tính năng mới hoặc thay đổi cách hoạt động của một số thành phần so với python 2.x. Vì vậy, để sử dụng các thành phần mới này hay là cách hoạt động mới của các thành phần này trong python 2 cần phải import thông qua module __future__
- Ví dụ: Để thực hiện phép chia của Python 3 trong python 2, cần phải thực hiện câu lệnh `from __future__ import division` :
```sh
from __future__ import division
var = 3 / 2
print var
>> test.py
1.5
```
Nếu không sử dụng `from __future__ import division` thì kết quả là `1`.
### Print function
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

### Reading input from keyboard
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

### integer division
- Trong python 2, kết quả của phép chia số nguyên sẽ là phần nguyên của thương số (vd: 5/2 = 2). Để kết quả 5/2 = 2.5 thì phải tồn tại một số float trong phép chia (vd: 5.0/2 =2.5)
- Trong python 3, Kết quả của phép chia số nguyên sẽ giữ nguyên thương số. vd: 5/2 =2.5; 4/2 = 2

### Unicode representation 
- Trong python 2, để hỗ trợ ký tự Unicode thì bắt buộc phải sử dụng câu lệnh khai báo hỗ trợ unicode.
```sh
# -*- coding: utf-8 -*-
var = "so sánh giữa python 2 và python 3"
print var
>> so sánh giữa python 2 và python 3
``` 
- Trong python 3, unicode được mặc định hỗ trợ. Vậy nên, không cần quan tâm đến unicode khi sử dung Python 3.

### range and xrange fucntion 
- Trong Python 2, hàm range tạo ra một list đối tượng được lưu trữ trong bộ nhớ, còn hàm xrange chỉ tạo ra một đối tượng khi được gọi đến. Rõ ràng, xrange sẽ có lợi về tiết kiệm bộ nhớ hơn so với range
- Trong Python 3, hàm range bị loại bỏ và hàm xrange được đổi tên thành hàm range.

### raise exception
- Trong python 2, tất cả cú pháp của raise exception đều được chấp nhận
- Trong python 3, chỉ cho phép sử dụng cú pháp có dấu ngoặc ()
```sh
raise IOError, "file error" #This is accepted in Python 2
raise IOError("file error") #This is also accepted in Python 2
raise IOError, "file error" #syntax error is raised in Python 3
raise IOError("file error") #this is the recommended syntax in Python 3
```
<h2><a name="object">3. Object</a></h2>
- Về cơ bản, lập trình hướng đối tượng trong python và các ngôn ngữ khác là giống nhau. Bên cạnh đó, python cũng tồn tại một số điểm khác biệt. Trong phần này, chúng ta sẽ đi tìm hiểu các điểm khác biệt này
- Để trình bày các khái niệm cơ bản của hướng đối tượng trong python, chúng ta sẽ sử dụng ví dụ một class sau:
```sh
class Student:
	"Document string for class (optional)"
	st_count = 0

	def __init__(self,name,fee):
		self.name = name
		self.fee = fee
		st_count += 1
	def displayCount(self):
		print ("number of students: ", self._st_count)
	def showInfo(self):
		print ("name: ",self.name," fee: ",self.fee)
```
- Trong python, các biến được khai báo bên ngoài các phương thức và bên trong lớp được gọi là "class variable" (trong ví dụ trên, st_count là class variable). Biến class được chia sẻ cho tất cả các instance của một lớp, có nghĩa là bất cứ một thay đổi nào về giá trị của biến class đều làm thay đổi giá trị của nó trên các instance còn lại của class. Biến class có thể được truy cập ở bất cứ chỗ nào thông qua đối tượng của lớp hoặc tên lớp.
- Ngoài ra, các biến được khai báo bên trong các phương thức của class được gọi là "instance variable" (trong ví dụ trên, name và fee là 2 biến instance) và các biến này là cụ thể với từng instance của class. Các biến này có thể được truy cập ở bất kỳ chỗ nào thông qua đối tượng. Và chúng ta có thể thêm sửa xóa các biến instance của một instance tùy ý ở bất kỳ đâu
```sh
student1 = Student("A", 2100)
student2 = Student("B", 2200)

#delete variable
del student1.fee

#add variable
student.mark =10

```
- Một điểm khá khác biệt ở Python đó là một lớp có thể kế thừa được từ nhiều lớp khác. Và đối với việc kế thừa nhiều lớp cha này, nếu 2 lớp cha có phương thức cùng chữ ký thì khi lớp con kế thừa sẽ ưu tiên gọi phương thức của lớp cha đầu tiên nhất trong danh sách kế thừa được định nghĩa.
```sh
class Parent1:
	def __init__(self):
		print("constructor parent 1")
	def display(self):
		print ("display parent 1")

class Parent2:
	def __init__(self):
		print("constructor parent 2")
	def display(self):
		print ("display parent 2")	

class Child (Parent1, Parent2):
	def __init__(self):
		print("constructor Child ")

childObj = Child()
childObj.display()
#output: display parent 1
```
- Nếu như trong các ngôn ngữ khác như Java, C++ các thuộc tính được bảo vệ không cho truy cập từ bên ngoài bằng private, protected thì trong python chỉ hỗ trợ private, các thuộc tính muốn ẩn đi thì chỉ cần thêm tiền tố `__` trước mỗi tên biến. Để có thể truy cập thay đổi dữ liệu thì phải sử dụng hàm get và set
```sh
class Student:
	"Document string for class (optional)"
	__st_count = 0

	def __init__(self,name,fee):
		self.name = name
		self.__fee = fee
		Student.__st_count += 1
	def displayCount(self):
		print ("number of students: ", Student.__st_count)
	def showInfo(self):
		print ("name: ",self.name," fee: ",self.__fee)
x = Student("a", 1200)
print (x.name)
#output: a

print (x.__fee)
#output: Traceback (most recent call last):
#  		 File "python", line 15, in <module>
# 		 AttributeError: 'Student' object has no attribute '__fee'

```

<h2><a name="iterator">4. Iterator</a></h2>
<h3><a name="iterable">4.1. Iterable</a></h3>
- Để tìm hiểu về Iterator, trước hết phải được khái niệm `iterable`. Iterable hiểu đơn giản là các đối tượng có thể sử dụng vòng lặp `for` để duyệt quá các phần tử. ví dụ: string, dictionary, tuple, list
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
- Hoạt động duyệt qua các phần tử của các đối tượng Iterable được gọi là Iteration.

<h3><a name="protocol_iter">4.2. Giao thức Iteration</a></h3>
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
<h2><a name="generator">5. Generator</a></h2>
- Về cơ bản, generator cũng là iterator, có nghĩa là generator cũng hỗ trợ giao thức iteration. Hàm generator trả về một dãy các kết quả thay vì một như các hàm bình thường
- Định nghĩa một hàm generator cũng tương tự như định nghĩa hàm thông thường, sử dụng từ khóa `def` để định nghĩa hàm và `yield` để trả về kết quả. 
- Điểm đặc biệt của generator nằm ở cách hoạt động với từ khóa trả về `yield`: Khi gọi phương thức `__next__()` ban đầu, hàm generator sẽ thực hiện các câu lệnh từ đầu cho đến khi gặp từ khóa trả về `yield` đầu tiên. Ở lần gọi phương thức `__next__()` tiếp theo, thay vì thực hiện lại từ đầu như hàm bình thường, hàm generator sẽ thực hiện tiếp các câu lệnh phía sau từ khóa `yield` trước đó. Cứ tiếp tục như vậy cho đến khi không còn từ khóa `yield` thì sẽ sinh ra `StopIteration` exception.
```sh
def num_sequence(n) :
	i = 0 
	while ( i < n ) :
		print ("before: ",i)
		yield i
		print ("after: ",i)
		i +=1
y = num_sequence(3)
print (y.__next__())
#Output: before: 0
#		 0
print (y.__next__())
#Output: after: 0
#		 before: 1
#		 1
print (y.__next__())
#Output: after: 1
#		 before: 2
#		 2
print (y.__next__())
#Output: after: 2 
#		 Traceback (most recent call last):
#  		 File "python", line 10, in <module>
#		 StopIteration

```
<h2><a name="decorator">6. Decorator</a></h2>
- Trong lập trình, sẽ có nhiều trường hợp chúng ta tạo muốn thêm các hoạt động, các tính năng cho các hàm đã được định nghĩa trước đó mà không muốn làm thay đổi nội dung của các hàm đó. Trong Python, vần đề này được giải quyết bằng kỹ thuật Decorator
- Để hiểu được Decorator, trước hết phải hiểu một số khái niệm sau trong Python

<h3><a name="function">6.1. Function</a></h3>
- Ví dụ ta có hàm sau:
```sh
def printInput(x):
	print (x)
```
- Trong Python, hàm cũng là một đối tượng. Vì vậy, Hàm sẽ có các tính chất như các đối tượng thông thường. Đó là: 
	- chúng ta có thể sử dụng các biến để tham chiếu đến các đối tượng hàm:
	```sh
	func_x = printInput
	func_x("hello python")
	#Output: hello python
	```
	- Gán biến này cho các biến khác:
	```sh
	func_y = func_x
	```
	- Thậm chí là xóa hàm như xóa các đối tượng và vẫn có thể gọi hàm thông qua các biến đã gán khác 
	```sh
	del printInput
	func_y("hello python")
	#output: hello python
	```
- Python cũng hỗ trợ hàm lồng nhau, có nghĩa là định nghĩa một hàm trong hàm khác. Tuy nhiên, các hàm được định nghĩa bên trong lại không gọi được ở bên ngoài hàm chứa nó
```sh
def printInput(x):
	def add_Input(y):
		return y + 'abc'
	return add_Input(x)
print (printInput("hello "))
#output: hello abc

print (add_input("hello"))
#output: Traceback (most recent call last):
#		 File "python", line 6, in <module>
#		 NameError: name 'add_Input' is not defined
```
- Ngoài ra, hàm trong Python còn có một tính chất nữa đó là nó có thể truyền vào tham số là một hàm và trả về một hàm khác:
```sh
def lower_input(x='abc'):
	return x.lower()

def upper_input(x='abc'):
	return x.upper()

def change_input(func_name):
	if func_name == lower_input: 
		return lower_input
	else:
		return upper_input
print (change_input(lower_input)())
#output: abc
```
- Cuối cùng, tất cả những tính chất trên đều xuất phát từ định nghĩa ** hàm là một đối tượng ** trong python. Vì vậy, định nghĩa này là rất quan trọng để ứng dụng hàm vào các kỹ thuật quan trọng trong python

<h3><a name="func_decorator">6.2. Function Decorator</a></h3>
- Ứng dụng các tính chất của một hàm trong python, người ta xây dựng một kỹ thuật gọi là decorator. Decorator là một hàm được truyền vào tham số là một hàm khác và thêm các tính năng mới cho hàm được truyền vào mà không làm thay đổi nội dung của hàm đó. Một ví dụ cơ bản về hàm decorator,
```sh
def say_hello():
	print ("hello ")

def func_decorator(name_func):
	def wrapper_func():
		print ("I'am python ")
		name_func()
		print ("world")
	return wrapper_func

var = func_decorator(say_hello)
var()
#output: I'am python
#		 hello
#		 world
```
- Chúng ta có thể thay thế câu lệnh `var = func_decorator(say_hello)` bằng cú pháp `@func_decorator`. cụ thể sử lại ví dụ trên như sau:
```sh
@func_decorator
def say_hello():
	print ("hello ")

say_hello()
#output: I'am python
#		 hello
#		 world
```
- Kết quả trả về của hàm decorator là một hàm. Vì vậy, hàm decorator này cũng có thể là tham số của một hàm decorator khác.
```sh
def func_decorator1(func_to_decorate):
	def wrapper_func():
		print ("before func to decorate 1")
		func_to_decorate()
		print ("after func to decorate 1")
	return wrapper_func		

def func_decorator2(func_to_decorate):
	def wrapper_func():
		print ("before func to decorate 2")
		func_to_decorate()
		print ("after func to decorate 2")
	return wrapper_func

def say_hello():
	print ("hello world")

a = func_decorator1(func_decorator2(say_hello))
a()

#output: before func to decorate 1
#		 before func to decorate 2
#		 hello world
#		 after func to decorate 2
#		 after func to decorate 1
``` 
- Python cũng hỗ trợ cú pháp nhiều decorator lồng nhau và thứ tự sắp xếp của các hàm decorator ảnh hưởng đến thứ tự thực hiện các hàm. cụ thể như sau:
```sh
@func_decorator1
@func_decorator2
def say_hello():
	print ("hello world")

a = say_hello
a()
#output: before func to decorate 1
#		 before func to decorate 2
#		 hello world
#		 after func to decorate 2
#		 after func to decorate 1

# sắp xếp lại thì kết quả sẽ khác
@func_decorator1
@func_decorator2
def say_hello():
	print ("hello world")

a = say_hello
a()
#output: before func to decorate 2
#		 before func to decorate 1
#		 hello world
#		 after func to decorate 1
#		 after func to decorate 2
```
- Trong các ví dụ trên, các hàm được decorate có đặc điểm là không có tham số truyền vào. Vậy, câu hỏi đặt ra là: Đối với các hàm có tham số truyền vào thì decorate chúng như thế nào? Và tham số đó được truyền vào như thế nào?
- Về bản chất, khi gọi một hàm decorator thì kết quả trả về là một hàm `wrapper`. Hàm `wrapper` này thực hiện các chức năng trước, sau hàm được decorate và gọi đến hàm được decorate. Vì vậy, nếu muốn truyền tham số cho hàm được decorate thì đơn giản là chúng ta định nghĩa hàm `wrapper` này có tham số truyền vào là các tham số của hàm được decorate hoặc là nhiều hơn nếu muốn.
```sh
def func_decorator(func_to_decorate):
	def wrapper_func( var1 , var2 , var3):
		print("before: ",var3)
		func_to_decorate(var1,var2)
		print("after: ",var3)
	return wrapper_func
@func_decorator
def say_hello(x,y):
	print (x,y)
a = say_hello
a("I'am python","hello world", "wrapper argument")
#output: before:  wrapper argument
# 		 I'am python   hello world
#		 after:  wrapper argument
```
- Bên cạnh việc sử dụng decorator để decorate các hàm thì chúng ta cũng có thể sử dụng các hàm decorator để thêm tính năng mới cho các phương thức của một class. Việc làm này cũng tương tự với decorator một hàm thông thường, chỉ khác ở chỗ tham số truyền vào của hàm `wrapper` có thêm tham số `self`.
```sh
def func_decorator(func_to_decorate):
	def wrapper_func(self,var1, var2)
		print("before")
		func_to_decorate(self,var1,var2)
		print("after")
	return wrapper_func
class Demo:
	def __init__(self,name):
		self.name = name
	@func_decorator
	def show(var1, var2):
		print (var1,var2)
demoObj = Demo("test")
demoObj.show("hello","world")
#output: before
#		 hello world
#		 after
```
- Khi decorator một hàm thì hàm đó sẽ được decorate mãi mãi mà không thể bỏ decorator được. Vậy, làm thế nào để sử dụng hàm gốc khi chưa decorator? cách làm đơn giản nhất là truyền cho hàm `wrapper` một biến tham chiếu đến hàm gốc.

<h3><a name="class_decorator">6.3. Class Decorator</a></h3>

- Các class trong python cũng là một đối tượng. Vì vậy, một class có đầy đủ tính chất của một đối tượng và đương nhiên class cũng có thể là tham số truyền vào hay là kết quả trả về cho một hàm
- Class Decorator là quá trình thêm các tính năng, các biến mới cho một class mà không làm thay đổi nội dung của class đó. Một ví dụ đơn giản về class sau:
```sh
class Demo:
	def __init__(self):
		print ("constructor Demo")
Demo.decorator
#Output: Traceback (most recent call last):
#  		 File "python", line 4, in <module>
#		 AttributeError: type object 'Demo' has no attribute 'new_variable'

def class_decorator(class_name):
	class_name.new_variable = "decorator variable"
	return class_name

DemoA = class_decorator(Demo)
print (DemoA.new_variable)
#output: 'decorator variable'

```
- Có một kỹ thuật cũng khá hay trong python đó là `singleton pattern`. Nó cho phép mỗi class chỉ có thể tạo ra duy nhất được một đối tượng. Kết hợp với class decorator thì kỹ thuật này rất hữu ích trong một số trường hợp.
```sh
def singleton(cls):
	instance = None
	def get_instance():
		nonlocal  instance
		if not instance:
			instance = cls()
		return instance
	return get_instance

@singleton
class Demo:
	def __init__(self):
		print ("constructor Demo")

x = Demo()
print(id(x))
y = Demo()
print (id(y))
#output: constructor Demo
#		 140111459146216
#		 140111459146216
```
- Tổng kết, Decorator còn rất nhiều kỹ thuật rất hữu ích và hay được sử dụng trong lập trình python vì vậy 
