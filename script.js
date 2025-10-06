/* Countdown Timer Section */
const countdownElement = document.getElementById("countdown");
const timerElement = document.getElementById("timer");
const startTimeDisplay = document.getElementById("start-time");

// 🕒 Set your stream start time here (Philippine time)
const streamStart = new Date("2025-10-06T22:39:00+08:00"); // Example: 8:15 PM PHT

// Display formatted start time
startTimeDisplay.textContent = streamStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

// Check if already refreshed before
const hasRefreshed = localStorage.getItem("streamRefreshed");
const now = new Date();

if (now >= streamStart) {
  // If user opens after stream start, show LIVE message and do not refresh
  countdownElement.innerHTML = "LIVE NOW!";
} else {
  const timerInterval = setInterval(() => {
    const now = new Date();
    const distance = streamStart - now;

    if (distance <= 0) {
      clearInterval(timerInterval);

      // Only refresh once
      if (!hasRefreshed) {
        countdownElement.innerHTML = "🚀 Starting the stream...";
        localStorage.setItem("streamRefreshed", "true");

        setTimeout(() => {
          location.reload();
        }, 2000);
      } else {
        countdownElement.innerHTML = "LIVE NOW!";
      }

    } else {
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);
      timerElement.textContent = `${hours.toString().padStart(2,'0')}:${minutes
        .toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
    }
  }, 1000);
}

/* HLS + Plyr Player with Manual Quality Switcher */
window.onload = function () {
  const sources = [
    {
      id: "player1",
      qualities: {
        480: "https://sin.media-delivery.net/mbc/tracks-v2a1/mono.m3u8?token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4R0NNIn0..D26IA_VzerIW_j25.83Khi46ZCUc6BIWn_HqYkdDIAbrLorarMeIWqJkHQmoiXrRR5VPaWjJTgHLfpO3-3kMiOt4J3Eat3afcWm1xQwi6_mewdhIuM4V9tgejQlTs7DpBvP7r7-dcz5GavcFfBMXgKgM4pDMp-8U3XFLzyAIPrxO5t5TsNGp64vpmOOVfA47-IXspStBeiyOulvGLCx0rR0_yun2qsxhwTgYndEFZXcx6s9GNz_DF0J9usGWltwtoU4t0cJORY9xk4Duorj5Qh01Aw7I1Glww0feKIQPpQrP6mM_rsKHjEGNkwDcHxJBNs-vSGBtge0wbdakLeh9_vG3qNnw9ldBVJaGO-s_79sp99BMevCw7HUltgmvEhT1n4CXhLRy_px3OB13M8uGlvKHyV6XUptjVXS2D0UlscVrLaKjwTxko7wrw0MO_mm2iAjd3WGUMU1OBUT5HYGD3Izf0HNs4KhQDz0Wnt57qcidNYCyH5OC1Wxv-zhAm7jMY8-qtuMLiHisX6MxI8szB2vm1ZElCJQ-cg9RalYyuLFDgeUsVCrPQ1yiM.XXAKPuNjrvkngyzMd_TIZw&platformLanguage=en",
        1080: "https://sin.media-delivery.net/mbc/tracks-v1a1/mono.m3u8?token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4R0NNIn0..D26IA_VzerIW_j25.83Khi46ZCUc6BIWn_HqYkdDIAbrLorarMeIWqJkHQmoiXrRR5VPaWjJTgHLfpO3-3kMiOt4J3Eat3afcWm1xQwi6_mewdhIuM4V9tgejQlTs7DpBvP7r7-dcz5GavcFfBMXgKgM4pDMp-8U3XFLzyAIPrxO5t5TsNGp64vpmOOVfA47-IXspStBeiyOulvGLCx0rR0_yun2qsxhwTgYndEFZXcx6s9GNz_DF0J9usGWltwtoU4t0cJORY9xk4Duorj5Qh01Aw7I1Glww0feKIQPpQrP6mM_rsKHjEGNkwDcHxJBNs-vSGBtge0wbdakLeh9_vG3qNnw9ldBVJaGO-s_79sp99BMevCw7HUltgmvEhT1n4CXhLRy_px3OB13M8uGlvKHyV6XUptjVXS2D0UlscVrLaKjwTxko7wrw0MO_mm2iAjd3WGUMU1OBUT5HYGD3Izf0HNs4KhQDz0Wnt57qcidNYCyH5OC1Wxv-zhAm7jMY8-qtuMLiHisX6MxI8szB2vm1ZElCJQ-cg9RalYyuLFDgeUsVCrPQ1yiM.XXAKPuNjrvkngyzMd_TIZw&platformLanguage=en"
      },
      defaultQuality: 1080
    }
  ];

  sources.forEach(src => {
    const video = document.getElementById(src.id);
    if (!video) return;

    let hls;
    let currentQuality = src.defaultQuality;

    function loadStream(quality) {
      const streamUrl = src.qualities[quality];
      if (!streamUrl) return;

      if (hls) hls.destroy(); // destroy previous instance
      hls = new Hls({ capLevelToPlayerSize: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(() => {
          video.muted = true;
          video.play();
        });
      });
    }

    const player = new Plyr(video, {
      autoplay: true,
      muted: false,
      seekTime: 10,
      controls: [
        "play-large",
        "play",
        "current-time",
        "mute",
        "volume",
        "captions",
        "settings",
        "airplay",
        "fullscreen"
      ],
      settings: ["quality", "speed", "captions"],
      quality: {
        default: src.defaultQuality,
        options: Object.keys(src.qualities).map(Number),
        forced: true,
        onChange: (newQuality) => {
          currentQuality = newQuality;
          loadStream(newQuality);
        }
      }
    });

    // Initial load
    if (Hls.isSupported()) loadStream(currentQuality);
    else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src.qualities[currentQuality];
      video.play();
    }

    /* WATERMARK */
    const watermark = document.createElement('img');
    watermark.src = 'https://uploads.onecompiler.io/43ddry4jt/43ymwg7hc/watermark.png';
    watermark.alt = 'Watermark';
    watermark.style.position = 'absolute';
    watermark.style.bottom = '20px';
    watermark.style.right = '40px';
    watermark.style.width = '80px';
    watermark.style.opacity = '0.8';
    watermark.style.pointerEvents = 'none';
    watermark.style.userSelect = 'none';
    watermark.style.zIndex = 9999;
    video.parentElement.appendChild(watermark);

    const adjustWatermark = () => {
      if (window.innerWidth < 768) {
        watermark.style.width = '60px';
        watermark.style.bottom = '15px';
        watermark.style.right = '30px';
        watermark.style.opacity = '0.9';
      } else {
        watermark.style.width = '80px';
        watermark.style.bottom = '15px';
        watermark.style.right = '60px';
        watermark.style.opacity = '0.8';
      }
    };
    adjustWatermark();
    window.addEventListener('resize', adjustWatermark);

    let lastTap = 0;
    watermark.addEventListener('touchend', () => {
      const now = new Date().getTime();
      if (now - lastTap < 300) {
        watermark.style.width =
          watermark.style.width === '60px' || watermark.style.width === '80px'
            ? '100px'
            : '60px';
      }
      lastTap = now;
    });

    player.on('enterfullscreen', async () => {
      try {
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock('landscape');
        }
      } catch (err) {
        console.warn('Auto-rotation not supported', err);
      }
      watermark.style.width = window.innerWidth < 768 ? '100px' : '120px';
      watermark.style.bottom = '30px';
      watermark.style.right = '60px';
    });

    player.on('exitfullscreen', async () => {
      try {
        if (screen.orientation && screen.orientation.unlock) {
          await screen.orientation.unlock();
        }
      } catch (err) {
        console.warn('Orientation unlock not supported', err);
      }
      adjustWatermark();
    });
  });
};
