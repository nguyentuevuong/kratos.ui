# This is an h1 tag
## This is an h2 tag
###### This is an h6 tag
===
###### Emphasis
*This text will be italic*
_This will also be italic_
**This text will be bold**
__This will also be bold__
_You **can** combine them_
*You __can__ also combine them*
Strikethrough uses two tildes. ~~Scratch this.~~
---
###### Links
[Sample URL](/clone-ui/nittsu)
[I'm an inline-style link](https://www.google.com)

[I'm an inline-style link with title](https://www.google.com "Google's Homepage")

[I'm a reference-style link][Arbitrary case-insensitive reference text]

[I'm a relative reference to a repository file](../blob/master/LICENSE)

[You can use numbers for reference-style link definitions][1]

Or leave it empty and use the [link text itself].

URLs and URLs in angle brackets will automatically get turned into links. 
http://www.example.com or &lt;http://www.example.com&gt; and sometimes example.com (but not on Github, for example).

Some text to show that the reference links can follow later.

[Arbitrary case-insensitive reference text]: https://www.mozilla.org
[1]: http://slashdot.org
[link text itself]: http://www.reddit.com

---
###### Image
![µmd.js](http://simonwaldherr.de/umd.png)
---
###### Mailto
Send to me: &lt;nguyentuevuong@gmail.com&gt;
---
###### Blockquote

> Blockquotes are very handy in email to emulate reply text.
> This line is part of the same quote.
> I think you should use an `addr` element here instead.

Quote break.

> This is a very long line that will still be quoted properly when it wraps. Oh boy let's keep writing to make sure this is long enough to actually wrap for everyone. Oh, you can *put* **Markdown** into a blockquote.

---
###### Table
this | *left* | **center** | right
-----|:-------|:--------:|------:
with | sample | content  | for
lorem| ipsum  | dolor    | sit
sit  | amet   | sed      | do
do   | eiusom | tempor   | with

id|name|addr|desc
-|-|-|-
1|nguyentuevuong|nguyentrai-anthi-hungyen|admin

Markdown | Less | Pretty
---|---|---
*Still* | `renders` | **nicely**
1 | 2 | 3

###### Code
```typescript
@handler({
    virtual: false,
    bindingName: 'code'
})
export class I18nBindingHandler implements KnockoutBindingHandler {
    init = (element: HTMLElement, valueAccessor: any, allBindingsAccessor: any, viewModel: any, bindingContext: KnockoutBindingContext) => {
        element.classList.add('pretty-print');
        ko.bindingHandlers.html.init!(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    }
    update = (element: HTMLElement, valueAccessor: any, allBindingsAccessor: any, viewModel: any, bindingContext: KnockoutBindingContext) => {
        element.classList.add('html-preview');
    }
}
```
```javascript
s = "Python syntax highlighting"
print s
```
```
No language indicated, so no syntax highlighting. 
But let's throw in a <b>tag</b>.
```
---
###### List

1. At vero eos et accusamus et iusto odio dignissimos ducimus
1. Qui blanditiis praesentium voluptatum deleniti atque corrupti
    + Quos dolores et quas molestias excepturi sint
    + Obcaecati *cupiditate **non** provident*
    + Et harum quidem rerum facilis est et expedita distinctio
        1. Neque porro quisquam
        2. est qui dolorem ipsum
        3. quia dolor sit amet
        4. consectetur adipisci velit
1. Quis autem vel eum iure reprehenderit
1. qui in ea voluptate velit esse
    - quia dolor sit amet
    - consectetur adipisci velit
1. Quis autem vel eum iure reprehenderit
1. qui in ea voluptate velit esse

###### Task list

1. [x] Mua lợn cho Mint
1. [ ] Mua trà sữa cho mẹ Mint

