
/* This is a helper function that decided the time in seconds for the video to start accordingly. */
function getCurrSecond()
	{
		var d = new Date();
		var currTime = d.toLocaleTimeString();
		var a = currTime.split(':');
		var seconds = parseInt((a[1]*60))+parseInt(a[2]);
		return seconds;
	}


/* This function sets the start time and video , then calls the youtube API to play the video */
function startVideoAtTime(videos,meta)
	{
		if (start_video!=undefined){
			st=start_video;
			start_video=undefined;
			onYouTubeIframeAPIReady(st,0);
			
			return;
		}
		var title=[];
		var times=[];
		var startAt=0;
		for(var i=0;i<meta.length;i++)
		{
			times[i]=meta[i].contentDetails.duration;
			title[i]=meta[i].snippet.title;
		}
		var secs = convertSecond(times);
		var currSec = getCurrSecond();

		var i;
		for(i=0;i<secs.length;i++)
		{
			vc=i;
		if(currSec<secs[i])
		{
			startAt=currSec;
			break;
		}
		else
			currSec-=secs[i];
		}
		console.log("Video " + videos[vc][0] + " at time : " +startAt);
		startTime=startAt;
		
		onYouTubeIframeAPIReady(videos[vc][0].toString(),startTime);
		document.getElementById("title").innerHTML=title[vc];
		//console.log("startTime is :" + startTime + "and the video Id is: " + responseString);


	}

/* This is a helper function that convert ISO 8601 time format into seconds */
function convertSecond(times)
	{
		var solns=[];
		for(var i=0;i<times.length;i++)
		{
		var reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
        var hours = 0, minutes = 0, seconds = 0, totalseconds;
        if (reptms.test(times[i])) {
        	var matches = reptms.exec(times[i]);
            if (matches[1]) hours = Number(matches[1]);
            if (matches[2]) minutes = Number(matches[2]);
            if (matches[3]) seconds = Number(matches[3]);
            solns[i] = hours * 3600  + minutes * 60 + seconds;

          }
		}

		return solns;
	}
/* This time function runs every second to keep track of the current program scheduled and identify when to start and stop programs */
function myTimer() {
    var d = new Date();
    var hh = d.toLocaleTimeString();
    var hhh =hh.split(':');
    if(parseInt(hhh[1])==0&&parseInt(hhh[2])==0)
    	location.reload();
    else if(parseInt(hhh[1])==59&&parseInt(hhh[2])>=45)
    document.getElementById("results").innerHTML = "Next Program Begins in " + (60 - parseInt(hhh[2])) + " Seconds" ;
    else
    {
    document.getElementById("results").style.color = "white";
    document.getElementById("results").innerHTML = hhh[0] + " : " + hhh[1] + " : " + hhh[2];


	}
}



