/***********************************************\
 * Mozio JavaScript challenge
 * Browser support is irrelevant here, but any comments on specific
 * methods you use is a plus to show deeper understanding of the language
 \***********************************************/
//ORIGINAL FIDDLE: http://jsfiddle.net/ca0oa75b/

//MY TEST FIDDLE: https://jsfiddle.net/wedct2b5/7/


/**
 * Task 1: Write a function that repeats the String
 * with the following output:
 * 'Mozio'.repeatify(3); // 'MozioMozioMozio';
 */
console.log('Mozio'.repeatString(3));
/************************************/
String.prototype.repeatString = String.prototype.repeatString || function(times) {
        var str = '';

        for (var i = 0; i < times; i++) {
            str += this;
        }

        return str;
    };

/************************************/

/**
 * Task 2: Refactor the following JavaScript to use just one eventListener
 * rather than binding invididual event listeners to each list element
 */

var list = document.querySelectorAll('.list li');
function logContent() {
    console.log(this.innerHTML);
}
for (var i = 0; i < list.length; i++) {
    list[i].addEventListener('click', logContent, false);
}
/************************************************/
/**
 * Supposing html like:
 <ul class="list">
 <li>1</li>
 <li>2</li>
 <li>3</li>
 </ul>
 *
 */
function logContent(e) {
    if (e.target !== e.currentTarget) {
        console.log(e.target.innerHTML);
    }
    e.stopPropagation();
}

var theParentList = document.querySelector(".list");
theParentList.addEventListener("click", logContent, false);

/**************************************************
/**
 * Task 3: Inspect the output in the console from clicking an
 * item from ".list2", each index is the same
 * Explain why, and also fix the problem to log the correct index
 */
var list2 = document.querySelectorAll('.list2 li');
for (var i = 0; i < list2.length; i++) {
    list2[i].addEventListener('click', function () {
        console.log('My index:', i);
    }, false);
}

/***********************************************/
the body of the event listener function is only executed when the click event occurs,
and it has access to the parent var i, so when the click event happens
the for loop has already been executed/finished,
    and at this point the value of i is already equal to the length of the list items

//a possible fix for this:
var list2 = document.querySelectorAll('.list2 li');

for (var i = 0; i < list2.length; i++) {
    list2[i].index = i;//save the index
    list2[i].addEventListener('click', function () {
        console.log('My index:', this.index);
    }, false);

}


/************************************************/

/**
 * Task 4: Explain why the logs happen in the following order:
 * one, three, two
 */
(function () {
    console.log('one');
    setTimeout(function() {
        console.log('two');
    }, 0);
    console.log('three');
})();

/**************************************************/

setTimeout()  puts execution of the referenced
function into the event queue if the browser is busy.
    with a value of zero passed as the second argument to setTimeout(),
    it attempts to execute the specified function "as soon as possible", but not guaranteed to be immediate, since
the execution of the function is placed on the event queue to occur on the next timer tick, and in fact
the function is not executed until the next tick occurs.
/*************************************************/

/**
 * Task 5: Explain how "this" works in this particular scenario (how iPad is logged, followed by iPhone)
 */
var product = 'iPhone';
var obj = {
    product: 'iMac',
    prop: {
        product: 'iPad',
        getProductName: function() {
            return this.product;
        }
    }
};
console.log(obj.prop.getProductName());
var test = obj.prop.getProductName;
console.log(test());

/**
 * Task 6: Return the file extension or "false" if no extension
 */
function getFileExtension(file) {

}
console.log(getFileExtension('mozio.png'));

/**
 * Task 7: Return the longest String in the Array
 */
function longestString(i) {

}
var longest = longestString([
    'coca-cola',
    'pepsi',
    'lemonade',
    'red bull'
]);
console.log(longest);

/**
 * Task 8: Sum all integers inside the nested Array
 */
function arraySum(i) {

}
var added = arraySum([[3,2,88],4,5, [10, [1,6,1]], 1]);
console.log(added);

/**
 * Task 9: Use the function below to write your own
 * Array.prototype.map equivalent to double each number
 */
var items = [1,5,8,2,6];
function map(collection, fn) {

}
var mapped = map(items, function (item) {
    return item * 2;
});
console.log(mapped);

/**
 * Task 10: Write a simple validation script for the above form
 * - If the required fields are not filled out, do not submit the form
 * - If the email is invalid, do not submit the form
 * - To validate the email, please call the validateEmail function
 * - The form should be able to have more fields added to it and
 still work, without changing the JavaScript
 - The form doesn't need to post to a specific URL but please comment
 inside the code to demonstrate where this would happen
 */

function validateEmail(str) {
    var regexp = /[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\.[a-z0-9-]+)*/;
    return regexp.test(str);
}