# Dropdown menu
A simple way to show dropdown menus for example under a button.

## Usage
```
const dropdown = new Dropdown(<element>, {
    content: <content>,
    centered: true,
    className: 'dropdown',
    closeOnScroll: false,
    closeOnClickInside: false,
    event: null,
});
```
`element`: parent element under which the dropdown is positioned  
`content`: wants either a HTML string or `HTMLElement` (for example a template)   
`centered`: boolean, center horizontally with the parent element  
`className`: CSS class name given to the dropdown element  
`closeOnScroll`: close dropdown when page is scrolled  
`closeOnClickInside`: close dropdown when the user clicks inside of it (e.g. for menus). Clicks outside the dropdown
always close it  
`event`: the JS event that triggered the dropdown to open, used to stop event propagation 
