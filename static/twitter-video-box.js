var jQueryPlugin = (window.jQueryPlugin = function(ident, func) {
    return function(arg) {
        if (this.length > 1) {
            this.each(function() {
                var $this = $(this);

                if (!$this.data(ident)) {
                    $this.data(ident, func($this, arg));
                }
            });

            return this;
        } else if (this.length === 1) {
            if (!this.data(ident)) {
                this.data(ident, func(this, arg));
            }

            return this.data(ident);
        }
    };
});

// 全屏: 基础函数
function _request_fullscreen(element) {
    if (element.requestFullscreen) element.requestFullscreen();
    else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
    else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
    else if (element.msRequestFullscreen) element.msRequestFullscreen();
}

function _exit_fullscreen() {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
}

function _is_fullscreen() {
    return (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement ||
        null
    );
}

window.twitterVideoPlayer = function($root) {
    const video = $root.first(".video-box");
    const video_element = $root.find("[data-video]");
    const video_preview = $root.find(".video-preview");
    const video_top = $root.find(".video-top");
    const video_start_btn = $root.find(".video-start-btn");
    const video_control_btn = $root.find(".video-control-btn");
    const video_control_play = $root.find(".video-control-play");
    const video_control_pause = $root.find(".video-control-pause");
    const video_voice = $root.find(".video-voice");
    const video_voice_btn = $root.find(".video-voice-btn");
    const video_voice_on = $root.find(".video-voice-on");
    const video_voice_off = $root.find(".video-voice-off");
    const full_screen_btn = $root.find(".full-screen-btn");
    const full_screen_open = $root.find(".full-screen-open");
    const full_screen_exit = $root.find(".full-screen-exit");
    const video_voice_slider = $root.find(".video-voice-slider-range");
    const video_voice_rail = $root.find(".video-voice-slider-rail");
    const video_voice_buffer = $root.find(".video-voice-slider-buffer");
    const video_slider = $root.find(".video-slider-container");
    const video_slider_rail = $root.find(".video-slider-rail");
    const video_slider_buffer = $root.find(".video-slider-buffer");
    const video_count_time = $root.find(".video-count-time");
    const video_count_fulltime = $root.find(".video-count-fulltime");
    const video_loading = $root.find(".video-loading");
    const video_reset = $root.find(".video-reset");
    const video_reset_btn = $root.find(".video-reset-btn");
    const video_contextMenu = $root.find(".video-contextMenu");
    const video_rotate_button = $root.find(".video-rotate-container");

    const vid = $(video_element).get(0),
        body_elem = $("body").get(0),
        fullscreen_container = $("#body-full-screen-container");

    let auto_loop = video.hasClass("auto-loop"),
        raw_container = null,
        last_scroll_top = 0;

    function play() {
        vid.play();
        video_control_play.hide();
        video_control_pause.show();
    }

    function pause() {
        vid.pause();
        video_control_pause.hide();
        video_control_play.show();
    }

    function rotate90({ force_back = false }) {
        if (video.hasClass("rotated") || force_back) {
            video.removeClass("rotated");
            video.css("height", "unset").css("width", "unset");
        } else {
            video.addClass("rotated");
            video.css("height", fullscreen_container.width()).css("width", fullscreen_container.height());
        }
    }

    function loading() {}

    function voiceOn() {
        vid.muted = true;
        $(video_voice_on).hide();
        $(video_voice_off).show();
    }

    function voiceOff() {
        vid.muted = false;
        $(video_voice_on).show();
        $(video_voice_off).hide();
    }

    // 全屏: 进一步封装
    function set_video_fullscreen() {
        // 记录当前滚动距离
        last_scroll_top = $(window).scrollTop();
        // 全屏容器
        _request_fullscreen(body_elem);
        raw_container = video.parent();
        fullscreen_container.show().append(video);
        // video-box
        video.addClass("full-screen");
        // 按钮
        full_screen_open.hide();
        full_screen_exit.show();
    }

    function cancel_video_fullscreen_event() {
        if (!fullscreen_container.find(".video-box").eq(0).is(video)) {
            return null;
        }
        // 容器
        fullscreen_container.hide();
        raw_container.prepend(video);
        // video-box
        rotate90({ force_back: true });
        video.removeClass("full-screen");
        // 按钮
        full_screen_open.show();
        full_screen_exit.hide();
        // 返回全屏前滚动到的位置
        setTimeout(() => {
            $(window).scrollTop(last_scroll_top);
        }, 500);
    }

    document.addEventListener("fullscreenchange", function(event) {
        if (!_is_fullscreen()) {
            cancel_video_fullscreen_event();
        }
    });

    function toggle_video_fullscreen() {
        if (_is_fullscreen()) {
            _exit_fullscreen();
        } else {
            set_video_fullscreen();
        }
    }

    function updateplayer() {
        var percentage = (vid.currentTime / vid.duration) * 100;
        video_slider_rail.css({ width: percentage + "%" });
        video_slider_buffer.css({ left: percentage - 1 + "%" });
        video_count_time.text(getFormatedTime());
        video_count_fulltime.text(getFormatedFullTime());
    }

    function getTimeState() {
        var mouseX = event.pageX - video_slider.offset().left,
            width = video_slider.outerWidth();

        var currentSeconeds = Math.round((mouseX / width) * vid.duration);
        var currentMinutes = Math.floor(currentSeconeds / 60);

        if (currentMinutes > 0) {
            currentSeconeds -= currentMinutes * 60;
        }
        if (currentSeconeds.toString().length === 1) {
            currentSeconeds = "0" + currentSeconeds;
        }
        if (currentMinutes.toString().length === 1) {
            currentMinutes = "0" + currentMinutes;
        }

        return currentMinutes + ":" + currentSeconeds;
    }

    function skip(event) {
        let mouseX = event.pageX - video_slider.offset().left,
            width = video_slider.outerWidth();
        // 旋转模式
        if (video.hasClass("rotated")) {
            mouseX = event.pageY - video_slider.offset().top;
        }
        vid.currentTime = (mouseX / width) * vid.duration;
        updateplayer();
    }

    function getFormatedFullTime() {
        var totalSeconeds = Math.round(vid.duration);
        var totalMinutes = Math.floor(totalSeconeds / 60);
        if (totalMinutes > 0) {
            totalSeconeds -= totalMinutes * 60;
        }
        if (totalSeconeds.toString().length === 1) {
            totalSeconeds = "0" + totalSeconeds;
        }
        if (totalMinutes.toString().length === 1) {
            totalMinutes = "0" + totalMinutes;
        }
        return totalMinutes + ":" + totalSeconeds;
    }

    function getFormatedTime() {
        var seconeds = Math.round(vid.currentTime);
        var minutes = Math.floor(seconeds / 60);

        if (minutes > 0) {
            seconeds -= minutes * 60;
        }
        if (seconeds.toString().length === 1) {
            seconeds = "0" + seconeds;
        }
        if (minutes.toString().length === 1) {
            minutes = "0" + minutes;
        }
        return minutes + ":" + seconeds;
    }

    video_start_btn.click(function() {
        $(video_preview).hide();
        play();
    });

    video_control_btn.click(function() {
        if (vid.paused) {
            play();
        } else {
            pause();
        }
        return false;
    });

    video_top.click(function() {
        if (vid.paused) {
            play();
        } else {
            pause();
        }
        return false;
    });

    video_voice_btn.click(function() {
        if (vid.muted === false) {
            voiceOn();
        } else {
            voiceOff();
        }
    });

    full_screen_btn.click(function() {
        toggle_video_fullscreen();
    });

    video_top.dblclick(function() {
        toggle_video_fullscreen();
    });

    video_voice_slider.on("input change", function() {
        var range = (localStorage[this.id] = $(this).val());
        video_voice_buffer.css("width", range * 100 + "%");
        vid.volume = range;
        video_voice_slider.attr("value", range);
        if (range == 0) {
            voiceOn();
        } else {
            voiceOff();
        }
    });

    video_voice_slider.each(function() {
        if (typeof localStorage[this.id] !== "undefined") {
            $(this).val(localStorage[this.id]);
        }
    });

    video_voice_slider
        .keyup(function() {
            var range = (localStorage[this.id] = $(this).val());
            video_voice_buffer.css("width", range * 100 + "%");
            vid.volume = range;
            video_voice_slider.attr("value", range);
            if (range == 0) {
                voiceOn();
            } else {
                voiceOff();
            }
        })
        .keyup();

    video_slider.click(function(event) {
        skip(event);
    });

    updateplayer();
    video_count_fulltime.text(getFormatedFullTime());

    $(vid).on("timeupdate", function() {
        updateplayer();
    });

    $(video_slider_buffer).on("input change", function() {
        updateplayer();
    });

    video_voice.hover(
        function() {
            video_slider.hide();
        },
        function() {
            video_slider.show();
        }
    );

    $(vid).on("ended", function() {
        if (auto_loop) {
            play();
        } else {
            video_reset.css("display", "flex");
        }
    });

    video_reset_btn.click(function() {
        play();
        video_reset.css("display", "none");
    });

    $(video).on("contextmenu", function(event) {
        event.preventDefault();
        video_contextMenu.show().css({
            top: event.pageY,
            left: event.pageX,
        });
    });

    $(window).click(function() {
        video_contextMenu.fadeOut("fast");
    });

    $(vid).on("progress", function() {
        loading();
    });

    video_rotate_button.click(rotate90);
};

$.fn.twitterVideoPlayer = jQueryPlugin("twitterVideoPlayer", twitterVideoPlayer);