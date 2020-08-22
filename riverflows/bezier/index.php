<?php

$today_date = getdate();
$year = $today_date["year"];
$month = $today_date["mon"];
$day = $today_date["mday"];


if ($day > 7) {
    $start_day = $day - 7;
    $start_month = $month;
    $start_year = $year;
} else {
    $start_day = 21 + $day;
    if ($month > 1) {
        $start_month = $month - 1;
        $start_year = $year;
    } else {
        $start_month = 12;
        $start_year = $year - 1;
    }
}

//THE NEW WAY: http://nwis.waterservices.usgs.gov/nwis/iv/?format=waterml,1.1&sites=09361500,%2009358000,%2009359020,%2009359500,%2009349800,%2009363500&startDT=2014-04-06&endDT=2015-06-13&parameterCd=00060

$sites = ["09358000", "09359020", "09359500", "09361500", "09363500"];  

//"09165000", "09166500", "09342500"

$loaded = 0;

$start_date = "" . $start_year . "-" . sprintf('%02d', $start_month) . "-" . sprintf('%02d', $start_day);
$end_date = "" . $year . "-" . sprintf('%02d', $month) . "-" . sprintf('%02d', $day);

$speed = 4;

if(isset($_POST['submit'])) {

    $loaded = 1;
    
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $start_date = $_POST["start"];
        $end_date = $_POST["end"];
        $speed = $_POST["speed"];
    }

    
    $fname = "http://nwis.waterservices.usgs.gov/nwis/iv/?format=waterml,1.1&sites=" . implode(",", $sites) . "&startDT=" . $start_date . "&endDT=" . $end_date . "&parameterCd=00060";
    
} 


?>
<html>

<head>
<link rel='stylesheet' href='/css/front_page.css'/>
<link rel='stylesheet' href='/css/flows_stylesheet.css'/>

<title>Flow Visualization</title>

<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<script src="http://cdnjs.cloudflare.com/ajax/libs/jquery-csv/0.71/jquery.csv-0.71.min.js"></script>
<script src="http://d3lp1msu2r81bx.cloudfront.net/kjs/js/lib/kinetic-v4.4.3.min.js"></script>
<script src="https://www.google.com/jsapi"></script>
<script src="/js/riverflows_spline.js"></script>


</head>

<body onload="displaystuff(<?php echo $loaded ?>)">

<div id="main_div">

<p3 id="home_link_black"><a href="/">home</a></p3>

<h1>
Animation of Southwest Colorado River Levels
</h1>

<div class="line_divider_2"></div>

<form id="time_range_form" method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>">
    Start Date: <input type="date" name="start" value="<?php echo $start_date ?>"><br>
    End Date: <input type="date" name="end" value="<?php echo $end_date ?>"><br>
    <input type="submit" name="submit" value="Submit"><br>
    Speed: <input type="range" name="speed" min="1" max="20" value="<?php echo $speed ?>"><br>
</form>

<p1 id="loading_text">Loading... this may take a few minutes, depending on how long the time period is...</p1>

<div id="all_the_stuff">

<div id="animate_button" onclick="loaddata(<?php echo htmlspecialchars(json_encode($fname)) ?>)">
    <p1>Animate it!</p1>
</div>
<p1 id="time_text">Time:</p1>

</div>


<br /><br />

<div id="flow_div">
    

    <div id="flow_canvas" style="position:absolute; left:-680px">
    
    </div>
    
    
        <!--
        <a id="flink1" xlink:href="http://waterdata.usgs.gov/co/nwis/uv?site_no=<? echo $sites[0] ?>" target= "blank" onmouseover="displaytitle(1)" onmouseout="hidetitle(1)">
        <circle cx="285" cy="246" r="10" id="flow1" class="flow" />
        </a>
        <a id="flink2" xlink:href="http://waterdata.usgs.gov/co/nwis/uv?site_no=<? echo $sites[1] ?>" target= "blank" onmouseover="displaytitle(2)" onmouseout="hidetitle(2)">
        <circle cx="38" cy="366" r="10" id="flow2" class="flow" />
        </a>
        <a id="flink3" xlink:href="http://waterdata.usgs.gov/co/nwis/uv?site_no=<? echo $sites[2] ?>" target= "blank" onmouseover="displaytitle(3)" onmouseout="hidetitle(3)">
        <circle cx="878" cy="508" r="10" id="flow3" class="flow" />
        </a>
        <a id="flink4" xlink:href="http://waterdata.usgs.gov/co/nwis/uv?site_no=<? echo $sites[3] ?>" target= "blank" onmouseover="displaytitle(4)" onmouseout="hidetitle(4)">
        <circle cx="660" cy="676" r="10" id="flow4" class="flow" />
        </a>
        <a id="flink5" xlink:href="http://waterdata.usgs.gov/co/nwis/uv?site_no=<? echo $sites[4] ?>" target= "blank" onmouseover="displaytitle(5)" onmouseout="hidetitle(5)">
        <circle cx="570" cy="356" r="10" id="flow5" class="flow" />
        </a>
        <a id="flink6" xlink:href="http://waterdata.usgs.gov/co/nwis/uv?site_no=<? echo $sites[5] ?>" target= "blank" onmouseover="displaytitle(6)" onmouseout="hidetitle(6)">
        <circle cx="513" cy="120" r="10" id="flow6" class="flow" />
        </a>
        <a id="flink7" xlink:href="http://waterdata.usgs.gov/co/nwis/uv?site_no=<? echo $sites[6] ?>" target= "blank" onmouseover="displaytitle(7)" onmouseout="hidetitle(7)">
        <circle cx="505" cy="145" r="10" id="flow7" class="flow" />
        </a>
        <a id="flink8" xlink:href="http://waterdata.usgs.gov/co/nwis/uv?site_no=<? echo $sites[7] ?>" target= "blank" onmouseover="displaytitle(8)" onmouseout="hidetitle(8)">
        <circle cx="445" cy="290" r="10" id="flow8" class="flow" />
        </a>
        <a id="flink9" xlink:href="http://waterdata.usgs.gov/co/nwis/uv?site_no=<? echo $sites[8] ?>" target= "blank" onmouseover="displaytitle(9)" onmouseout="hidetitle(9)">
        <circle cx="385" cy="500" r="10" id="flow9" class="flow" />
        </a>
        <a id="flink10" xlink:href="http://waterdata.usgs.gov/co/nwis/uv?site_no=<? echo $sites[9] ?>" target= "blank" onmouseover="displaytitle(10)" onmouseout="hidetitle(10)">
        <circle cx="395" cy="675" r="10" id="flow10" class="flow" />
        </a>

        
    <div id="all_tooltips" height="691px" width="1060px">
        <p1 class="fancy_tooltip" id=ftitle1 style="left:285px; top:246px">Dolores Below Rico:</p1>
        <p1 class="fancy_tooltip" id=ftitle2 style="left:38px; top:366px">Dolores At Dolores:</p1>
        <p1 class="fancy_tooltip" id=ftitle3 style="left:878px; top:508px">San Juan At Pagosa:</p1>
        <p1 class="fancy_tooltip" id=ftitle4 style="left:660px; top:676px">Piedra Near Arboles:</p1>
        <p1 class="fancy_tooltip" id=ftitle5 style="left:570px; top:356px">Vallecito near Bayfield:</p1>
        <p1 class="fancy_tooltip" id=ftitle6 style="left:513px; top:120px">Animas At Silverton:</p1>
        <p1 class="fancy_tooltip" id=ftitle7 style="left:505px; top:145px">Animas Below Silverton:</p1>
        <p1 class="fancy_tooltip" id=ftitle8 style="left:445px; top:290px">Animas At Tall Timbers:</p1>
        <p1 class="fancy_tooltip" id=ftitle9 style="left:385px; top:500px">Animas At Durango:</p1>
        <p1 class="fancy_tooltip" id=ftitle10 style="left:395px; top:675px">Animas At Cedar Hill:</p1>
    </div>
            -->
    
    
</div>

</div>


</body>

</html>

<?php
include '../main_footer.html';
?>