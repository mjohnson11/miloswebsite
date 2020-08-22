//A function for changing the text below the app when the user clicks on a question
//mark button
function ChangeDescrip(keep_descrip) {
	var descrip_list = document.getElementsByClassName("description");
	for (var i = 0; i < descrip_list.length; i++) {
		if (descrip_list[i].id == keep_descrip) {
			descrip_list[i].style.display = "block";
		} else {
			descrip_list[i].style.display = "none";
		}
	}
}