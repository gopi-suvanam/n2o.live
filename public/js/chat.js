var chatid=0;
var pubnub = new PubNub({
	publishKey : 'pub-c-d3cd80ea-053f-4c78-870c-f78c2bbe6fa6',
	subscribeKey : 'sub-c-9a4f72ac-b234-11e6-a7bb-0619f8945a4f'
});

pubnub.addListener({

	message: function(m) {
		// handle message
		var channelName = m.channel; // The channel for which the message belongs
		var channelGroup = m.subscription; // The channel group or wildcard subscription match (if exists)
		var pubTT = m.timetoken; // Publish timetoken
		var msg = m.message; // The Payload
		if(msg.type=="smiley"){
			$("#"+msg.content+"-smiley").show(500);
			$("#"+msg.content+"-smiley").hide(500);
		}
		else if(msg.type=="text"){
			chatid=chatid+1;
			var one_line="<div class='newchat' id='newchat"+chatid+"'>"+msg['content']+"</div>";
			one_line=one_line+"<div style='clear:both'></div>";
			$("#chat-div").append(one_line);

			//$("#one-line-chat").html($("#one-line-chat").html()+one_line);
			$("#newchat"+chatid).fadeIn(50).promise().done(function(){
				$("#newchat"+chatid).fadeOut(5000).promise();
			});
		}
		
	}
});

pubnub.subscribe({
    channels: ['my_channel']
});

broadcastmsg=function(text){
	pubnub.publish(
		
		{
			message: { type: 'text',content:text },
			channel: 'my_channel',
			sendByPost: false, // true to send via post
			storeInHistory: false, //override default storage options
			meta: { "cool": "meta" } // publish extra meta with the request
		},
		function (status, response) {
			// handle status, response
		}
	);
}

broadcastsmiley=function(smiley){
	pubnub.publish(
		
		{
			message: { type: 'smiley',content:smiley },
			channel: 'my_channel',
			sendByPost: false, // true to send via post
			storeInHistory: false, //override default storage options
			meta: { "cool": "meta" } // publish extra meta with the request
		},
		function (status, response) {
			// handle status, response
		}
	);
}

muteChat=function(){
	pubnub.unsubscribe({
		channels: ['my_channel']
	});
	$("#muteChatBtn").hide();
	$("#unmuteChatBtn").show();
	$("#chat-text-box").hide();
}
unmuteChat=function(){
	pubnub.subscribe({
		channels: ['my_channel']
	});
	$("#unmuteChatBtn").hide();
	$("#muteChatBtn").show();
	$("#chat-text-box").show();
}


sendChat=function(){
	broadcastmsg($("#chatinput").val());
	$("#chatinput").val('');

}

$(document).keyup(function (e) {
    if ($("#chatinput:focus") && (e.keyCode === 13)) {
       sendChat();
    }
 });