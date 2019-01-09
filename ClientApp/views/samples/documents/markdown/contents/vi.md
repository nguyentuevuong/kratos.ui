## Ngôn ngữ đánh dấu văn bản thô (`Markdown`) #{ngon-ngu-danh-dau-van-ban-tho}

> Đây là phiên bản tinh chỉnh nâng cao (chuyển sang `typescript`) của thư viện: [micromarkdown.js](https://github.com/SimonWaldherr/micromarkdown.js)
> Chân thành cảm ơn [Simon Waldherr](https://twitter.com/simonwaldherr) đã cho tôi tham khảo mã nguồn của anh.

#### Giải thích #{giai-thich}
> `Markdown` là một ngôn ngữ đánh dấu với cú pháp văn bản thô, được thiết kế để có thể dễ dàng chuyển thành HTML và nhiều định dạng khác sử dụng một công cụ cùng tên. Nó thường được dùng để tạo các tập tin readme, viết tin nhắn trên các diễn đàn, và tạo văn bản có định dạng bằng một trình biên tập văn bản thô.

#### Sử dụng #{su-dung}
> Tất cả các bài viết hướng dẫn ở trong hệ thống này sẽ được viết dưới dạng markdown (`md`) và đặt vào thư mục `contents` cùng cấp với `view` và `viewmodel` để biểu diễn hướng dẫn trong các mục: [Tài liệu hướng dẫn](/sample/documents/markdown), [Biểu tượng & màu sắc](/sample/uis/color), [Điều khiển sắp xếp](/sample/sortable/simple), [Điều khiển điều hướng](/sample/navigate/tab), [Điều khiển dạng nhập](/sample/input/text), [Điều khiển dạng chọn](/sample/selection/table).

## Cú pháp #{cu-phap}

#### Headline
> Để biểu thị một đường kẻ ngang (thẻ `<hr />`) ta chỉ cần sử dụng 3 ký tự (trở lên) `-` hoặc `*` hoặc `=` liên tiếp trên một dòng văn bản.

###### Mã
```raw
Ba ký tự hoặc hơn...
Dấu trừ:
---
Dấu hoa thị:
***
Dấu gạch nối:
___
Dấu bằng:
===
```
###### Kết quả
Ba ký tự hoặc hơn...
Dấu trừ:
---
Dấu hoa thị:
***
Dấu gạch nối:
___
Dấu bằng:
===

#### Headers
> Để biểu thị một thẻ header (`<h1>H1</h1>`, `<h2>H2</h2>`, `<h3>H3</h3>`, `<h4>H4</h4>`, `<h5>H5</h5>`, `<h6>H6</h6>`) ta sử dụng theo cú pháp `# tiêu đề #{id}`

###### Mã
```raw
# H1 #{h1}
## H2 #{h2}
### H3 #{h3}
#### H4 #{h4}
##### H5 #{h5}
###### H6 #{h6}
```
###### Kết quả
# H1 #{h1}
## H2 #{h2}
### H3 #{h3}
#### H4 #{h4}
##### H5 #{h5}
###### H6 #{h6}

#### Đậm, nghiêng
> Để hiển thị những ký tự đậm, nghiêng, gạch ngang ta viết như sau: `*nghiêng*` hoặc `_nghiêng_`, `**đậm**` hoặc `__đậm__`, `~~gạch ngang~~`

###### Mã
```raw
Để biểu thị chữ nghiêng, ta dùng *một cặp dấu sao* hoặc _một cặp dấu gạch nối_.
Để biểu thị chữ đậm, ta dùng **hai cặp dấu sao** hoặc __hai cặp dấu gạch nối__.
Để biểu thị chữ đậm + nghiêng, ta dùng ***ba cặp dấu sao*** hoặc ___ba cặp dấu gạch nối___.

Hoặc có thể kiết hợp như thế này để có **chữ nghiêng và _chữ đậm + nghiêng_** hay như thế này để có __chữ đậm và *chữ đậm + nghiêng*__

Để gạch giữa một khối chữ, ta dùng cặp dấu sau: ~~gạch giữa khối chữ này~~.
```
###### Kết quả
Để biểu thị chữ nghiêng, ta dùng *một cặp dấu sao* hoặc _một cặp dấu gạch nối_.
Để biểu thị chữ đậm, ta dùng **hai cặp dấu sao** hoặc __hai cặp dấu gạch nối__.
Để biểu thị chữ đậm + nghiêng, ta dùng ***ba cặp dấu sao*** hoặc ___ba cặp dấu gạch nối___.

Hoặc có thể kiết hợp như thế này để có **chữ nghiêng và _chữ đậm + nghiêng_** hay như thế này để có __chữ đậm và *chữ đậm + nghiêng*__

Để gạch giữa một khối chữ, ta dùng cặp dấu sau: ~~gạch giữa khối chữ này~~.

#### Danh sách #{danh_sach}
> Danh sách có 2 dạng, một là danh sách có sắp xếp `orderlist` hay `ol`, hai là danh sách không sắp xếp `unoderlist` hay `ul`.
> Để hiển thị danh sách có sắp xếp, ta đánh số dạng `1. ` trước mỗi mục của danh sách.
> Để hiển thị danh sách không sắp xếp, ta đánh dấu `-` hoặc `+` trước mỗi mục của danh sách.
> Có thể lồng nhiều danh sách vào nhau như ví dụ dưới đây (mỗi danh sách sẽ thụt vào 1 dấu cách tuỳ theo thứ tự lồng nhau):

###### Mã
```raw
1. First ordered list item
2. Another item
    - Unordered sub-list.
    - Unordered sub-list.
1. Actual numbers don't matter, just that it's a number
    1. Ordered sub-list
    1. Ordered sub-list
4. And another item.
```
###### Kết quả
1. First ordered list item
2. Another item
    - Unordered sub-list.
    - Unordered sub-list.
1. Actual numbers don't matter, just that it's a number
    1. Ordered sub-list
    1. Ordered sub-list
4. And another item.


#### Liên kết #{lien_ket}
> Liên kết trong phiên bản markdown này hỗ trợ những kiểu liên kết sau:
> Dạng chuẩn: `[văn bản liên kết](đường link liên kết)`
> Dạng chuẩn, có tiêu đề: `[văn bản liên kết](đường link liên kết "tiêu đề liên kết")`
> Dạng mở rộng đơn: `[văn bản/chỉ dấu liên kết]` sẽ có chỉ dấu liên kết `[chỉ dấu liên kết]: (đường link liên kết)`
> Dạng mở rộng kép: `[văn bản liên kết][chỉ dấu liên kết]` sẽ có chỉ dấu liên kết `[chỉ dấu liên kết]: (đường link liên kết)`

###### Mã
```raw
[I'm an inline-style link](https://www.google.com)
[I'm an inline-style link with title](https://www.google.com "Google's Homepage")
[I'm a reference-style link][Arbitrary case-insensitive reference text]
[I'm a relative reference to a repository file](../blob/master/LICENSE)
[You can use numbers for reference-style link definitions][1]
Or leave it empty and use the [link text itself].
Some text to show that the reference links can follow later.

[arbitrary case-insensitive reference text]: https://www.mozilla.org
[1]: http://slashdot.org
[link text itself]: http://www.reddit.com
```
###### Kết quả
[I'm an inline-style link](https://www.google.com)
[I'm an inline-style link with title](https://www.google.com "Google's Homepage")
[I'm a reference-style link][Arbitrary case-insensitive reference text]
[I'm a relative reference to a repository file](../blob/master/LICENSE)
[You can use numbers for reference-style link definitions][1]

Or leave it empty and use the [link text itself].
Some text to show that the reference links can follow later.

[arbitrary case-insensitive reference text]: https://www.mozilla.org
[1]: http://slashdot.org
[link text itself]: http://www.reddit.com

#### Liên kết ảnh #{lien-ket-anh}
> Để hiển thị một liên kết ảnh, ta có cấu trúc như sau: `![tiêu đề của ảnh](đường link dẫn tới ảnh)`:

###### Mã
```raw
![µmd.js](http://simonwaldherr.de/umd.png)
![alt text](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png)
```
###### Kết quả
![µmd.js](http://simonwaldherr.de/umd.png)
![alt text](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png)


#### Thẻ mã (code) #{ma}
> Để hiển thị một đoạn mã trong một dòng như `let a = 'universal';`, thì chỉ cần dùng cặp nháy sau `norenderlet a = 'universal';`
> Để hiển thị một đoạn mã trong nhiều dòng, thì viết như ví dụ bên dưới:

###### Mã
<pre class="pretty-print">```norender javascript
var s = "JavaScript syntax highlighting";
alert(s);
```
 
```norender python
s = "Python syntax highlighting"
print s
```
 
```norender html
No language indicated, so no syntax highlighting. 
But let's throw in a <b>tag</b>.
```
</pre>
###### Kết quả
```javascript
var s = "JavaScript syntax highlighting";
alert(s);
```
<pre class="pretty-print">s = "Python syntax highlighting"
print s
</pre>
```html
No language indicated, so no syntax highlighting. 
But let's throw in a <b>tag</b>.
```

#### Bảng biểu #{table}
> Để hiển thị một bảng biểu (`table`), ta có cấu trúc như sau:
> Trong đó, dòng thứ 2 là dòng có tác dụng phân cách `head` và `body` của `table` đồng thời cũng là căn lề của các cột trong `body`.
> Để căn lề ta dùng ký tự `:` với cấu trúc sau: `-`: `không căn lề`, `:-`: `căn lề trái`, `-:`: `căn lề phải`, `:-:`: `căn chính giữa`.
> Ngoài căn lề, chúng ta có thể sử dụng cấu trúc *nghiêng*, **đậm**, ~~gạch ngang~~ cho các nội dung trong bảng biểu.

###### Mã
<pre class="pretty-print">:norender:this | *left* | **center** | right
-----|:-------|:--------:|------:
with | sample | content  | for
lorem| ipsum  | dolor    | sit
sit  | amet   | sed      | do
do   | eiusom | tempor   | with
<br />
:norender:id|name|addr|desc
-|-|-|-
1|nguyentuevuong|nguyentrai-anthi-hungyen|admin
</pre>
###### Kết quả

this | *left* | **center** | right
-----|:-------|:--------:|------:
with | sample | content  | for
lorem| ipsum  | dolor    | sit
sit  | amet   | sed      | do
do   | eiusom | tempor   | with

id|name|addr|desc
-|-|-|-
1|nguyentuevuong|nguyentrai-anthi-hungyen|admin
