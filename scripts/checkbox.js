console.log("HERE!");
var filters = [document.getElementByID("genreCheck-0")];

/*filters.array.forEach(chck => {
    chck.addEventListner('change',function() {
        if (this.checked) {
            console.log("Checkbox is checked..");
        } else {
            console.log("Checkbox is not checked..");
        }
    });
});*/
filters[0].addEventListner('change',function() {
    if (this.checked) {
        console.log("Checkbox is checked..");
    } else {
        console.log("Checkbox is not checked..");
    }
});
