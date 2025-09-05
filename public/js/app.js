// Firebase init
const getAllChannels = firebase.functions().httpsCallable("getAllChannels");
const getChannel = firebase.functions().httpsCallable("getChannel");

// Example: Load all channels
async function loadChannels() {
  const res = await getAllChannels({ tvname: "MyTV" });
  console.log("Channels:", res.data.channels);
}

// Example: Load one channel + show latest video
async function loadChannel(channel) {
  const res = await getChannel({ tvname: "MyTV", channel });
  console.log(res.data);

  if (res.data.videos && res.data.videos.length > 0) {
    const videoId = res.data.videos[0][0];
    document.getElementById("player").src =
      `https://www.youtube.com/embed/${videoId}`;
  }
}

loadChannels();
loadChannel("SomeChannel");
