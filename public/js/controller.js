// =========================
// N2O Controller
// =========================

// Globals
let an = 1;
let first_load = true;
let vc = 0;
let startTime = 0;
let apiR;
let pLindex = 0;
let player;
let curr_video = '';
let videos = [];
let pList = [];
let video_details = [];

// --- Load YouTube Iframe API ---
function loadScript() {
  if (typeof YT === "undefined" || typeof YT.Player === "undefined") {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }
}

// --- YouTube Player Ready ---
function onPlayerReady(event) {
  event.target.playVideo();
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    if (videos.length - vc > 1) {
      vc++;
      player.loadVideoById(videos[vc][0]);
    } else {
      vc = 0;
      pLindex++;
      if (pLindex < pList.length) {
        setVideoList();
      }
    }
  }
}

// --- Create Player ---
function onYouTubeIframeAPIReady(vidId, startTime) {
  const k = vidId.toString();
  curr_video = k;
  player = new YT.Player("player1", {
    width: "100%",
    height: "100%",
    videoId: k,
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
    playerVars: {
      autoplay: 1,
      start: startTime || 0,
      controls: 0,
      disablekb: 1,
      rel: 0,
      modestbranding: 1,
    },
  });
}

// --- Controls ---
function stopVideo() {
  player.pauseVideo();
  $("#pause").hide();
  $("#play").show();
}

function startVideo() {
  if (first_load) {
    player.playVideo();
  }
  first_load = false;
}

function muteVideo() {
  player.mute();
  $("#mute").hide();
  $("#unmute").show();
}

function unmuteVideo() {
  player.unMute();
  $("#unmute").hide();
  $("#mute").show();
}

function playVideo() {
  player.playVideo();
  $("#play").hide();
  $("#pause").show();
}

// --- Init from Firebase Data ---
async function onClientLoad() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const tvname = urlParams.get("tvname") || "DefaultTV";
    const channelName =
      window.location.pathname.replace("/", "").replace(".html", "") ||
      "DefaultChannel";

    const getChannel = firebase.functions().httpsCallable("getChannel");
    const res = await getChannel({ tvname, channel: channelName });
    const { keywords, videos: v, contentDetails, logo } = res.data;

    videos = v || [];
    video_details = contentDetails || [];

    // update logo/favicon if present
    if (logo && logo.length > 0 && logo[0].length > 0) {
      $("#logo").attr("src", logo[0][0]);
      $("#favicon").attr("href", logo[0][0]);
      $("meta[property='og\\:image']").attr("content", logo[0][0]);
    }

    if (videos.length > 0) {
      onYouTubeIframeAPIReady(videos[0][0], 0);
    }

    if (video_details.length > 0) {
      $("#title").text(video_details[0].snippet.title);
    }
  } catch (err) {
    console.error("Error loading channel:", err);
  }
}

// --- Sharing + UI ---
function copy() {
  window.prompt("Copy to clipboard: Ctrl+C, Enter", location.href);
}

function whatsapp_share() {
  window.location.href =
    "https://api.whatsapp.com/send?text=" + window.location.href;
}

function toggle_controls() {
  $("#controls").fadeToggle("slow");
  $("#qwerty").fadeToggle("slow");
  setTimeout(function () {
    if ($("#qwerty").css("display") === "block") {
      $("#controls").fadeToggle("slow");
      $("#qwerty").fadeToggle("slow");
    }
  }, 5000);
}

// --- Fullscreen ---
function toggle_full_screen(elem) {
  elem = elem || document.documentElement;
  if (
    !document.fullscreenElement &&
    !document.mozFullScreenElement &&
    !document.webkitFullscreenElement &&
    !document.msFullscreenElement
  ) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

// --- Reload with animation ---
function reload() {
  document.body.classList.add("animated");
  document.body.classList.add("shake");

  setTimeout(() => {
    window.location.href = "/";
  }, 500);
}

// --- Start things up ---
loadScript();
window.onload = onClientLoad;
