$(function(){

	var messages = [];

	var messages_template = Handlebars.compile($('#messages-template').html());

	var peer_id;
	
	/* for peerserver cloud service
	var peer = new Peer( 
		{
			key: 'YOUR PEERSERVER CLOUD KEY',
			debug: 3,
			config: {'iceServers': [
				{ url: 'stun:stun1.l.google.com:19302' },
				{ url: 'turn:numb.viagenie.ca', credential: 'muazkh', username: 'webrtc@live.com' }
			]}
		}
	);
	*/
	
	
	var peer = new Peer({
	  host: 'YOURWEBSITE.com', port: 3000, path: '/peerjs',
	  debug: 3,
	  config: {'iceServers': [
	    { url: 'stun:stun1.l.google.com:19302' },
	    { url: 'turn:numb.viagenie.ca', credential: 'muazkh', username: 'webrtc@live.com' }
	  ]}
	});

	peer.on('open', function(){
		console.log('open');
		$('#id').text(peer.id);
		console.log('peer id: ' + peer.id);
	});

	
	

	var name;
	var conn;

	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

	function getVideo(callback){
		
		navigator.getUserMedia({audio: true, video: true}, callback, function(error){
			console.log(error);
			alert('An error occured. Please try again');
		});

	}

	getVideo(function(stream){
		window.localStream = stream;
		onReceiveStream(stream, 'my-camera');
	});


	function onReceiveStream(stream, element_id){

		var video = $('#' + element_id + ' video')[0];
		video.src = window.URL.createObjectURL(stream);
		
	}


	$('#login').click(function(){
		name = $('#name').val();
		peer_id = $('#peer_id').val();
		if(peer_id){

			conn = peer.connect(peer_id);
			
			conn.on('data', handleMessage);

		}

		$('#chat').removeClass('hidden');
		$('#connect').addClass('hidden');
	});



	peer.on('connection', function(connection){
		console.log('connection');
		console.log(connection);
		conn = connection;
		peer_id = connection.peer;
		
		conn.on('data', handleMessage);

		console.log('remote peer id: ');
		console.log(connection.peer);
	});
	

	function handleMessage(data){
		
		var header_plus_footer_height = 285;
		var base_height = $(document).height() - header_plus_footer_height;
		var messages_container_height = $('#messages-container').height();
		
		messages.push(data);

		var html = messages_template({'messages' : messages});
		
		$('#messages').html(html);

		if(messages_container_height >= base_height){
			$('html, body').animate({ scrollTop: $(document).height() }, 500);
		}
	}


	function sendMessage(){
		var text = $('#message').val();
		var data = {
			'from': name,
			'text': text
		};

		conn.send(data);
		handleMessage(data)

		$('#message').val('');
	}


	$('#message').keypress(function(e){
    	if(e.which == 13){
        	sendMessage();
    	}
	});


	$('#send-message').click(sendMessage);



	$('#call').click(function(){

		console.log('calling');
		
		var call = peer.call(peer_id, window.localStream);
		
		console.log('peer: ' + peer_id);

		call.on('stream', function(stream){
			console.log('received peer stream');
			console.log(stream);
			onReceiveStream(stream, 'peer-camera');
		});

	});


	peer.on('call', function(call){

		console.log('accepted call');
		onReceiveCall(call);
		
	});

	function onReceiveCall(call){

		console.log('answering call with my stream');
		console.log(window.localStream);
		call.answer(window.localStream);
			
		call.on('stream', function(stream){
			console.log('receiving peer stream');
			onReceiveStream(stream, 'peer-camera');
		});

	}

});