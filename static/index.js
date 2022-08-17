const PHOTO_VIEWER_SETTINGS = {
    toolbar: {
        zoomIn: 4,
        zoomOut: 4,
        oneToOne: 4,
        reset: 4,
        prev: {
            show: 1,
            size: "large",
        },
        play: 0,
        next: {
            show: 1,
            size: "large",
        },
        rotateLeft: 4,
        rotateRight: 4,
        flipHorizontal: 4,
        flipVertical: 4,
    },
};

function reset_vote_status(elem) {
    if (elem.attr("reset-finished")) {
        return null;
    }
    const deadline = parseFloat(elem.attr("data-deadline")) * 1000;
    elem.text(
        deadline <= Date.now() ? "Final results" : `Unfinished until ${elem.attr("data-deadline-dt").split(" ")[0]}`
    );
    elem.attr("reset-finished", 1);
}

function media_init(box) {
    // 视频播放器
    box.find(".video-box").twitterVideoPlayer();

    // 图片浏览
    box.find(".media-photos-container").each(function() {
        new Viewer(this, PHOTO_VIEWER_SETTINGS);
    });
}

class AutoLoadManager {
    constructor() {
        // elements
        this.container = $("div.row.tweets-list-row");
        this.loading_div = $("div.row.loading-row").hide();
        this.no_more_tip = $("div.row.no-more-tip-row").hide();
        // values
        this.split_line = new RegExp("-{88}", "g");
        this.max_part = 0;
        this.fetch_lock = false;
        this.finished = false;
    }

    _is_touching_bottom() {
        return window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 302;
    }

    verify() {
        if (!this._is_touching_bottom() || this.fetch_lock || this.finished) {
            return null;
        }
        const that = this;
        this.loading_div.show();
        this.fetch_lock = true;
        $.get(
                window.location.href.replace(/\?.+$/, "").replace(/\.html$/, `/part-${that.max_part + 1}.html`),
                function(data, status_code) {
                    data.split(that.split_line).forEach((elem) => {
                        elem = $(elem);
                        that.container.append(elem);
                        media_init(elem);
                    });
                    ++that.max_part;
                }
            )
            .fail(function(error) {
                that.finished = 404 === error.status;
                if (that.finished) {
                    that.no_more_tip.show();
                }
            })
            .always(function() {
                that.loading_div.hide();
                that.fetch_lock = false;
            });
    }

    run() {
        const that = this;
        setInterval(() => {
            that.verify();
        }, 300);
    }
}

$(function() {
    media_init($(document));
    new AutoLoadManager().run();

    setInterval(() => {
        $(".is-vote-finished").each(function() {
            reset_vote_status($(this));
        });
    }, 500);
});