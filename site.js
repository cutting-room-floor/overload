var token = '45ecd46dc0e2cc495f639ec09e1f8b660a39543d';
// var token = getCookie('access_token');

$(function() {

    var idx = 0;
    var initial = false;
    var n = [];
    var page = 1;

    load(page);

    function load(p) {
      $.ajax({
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/vnd.github.v3.html+json'
          },
          url: 'https://api.github.com/notifications?access_token=' + token + '&_=' + Date.now() + '&page=' + p,
          type: 'GET',
          success: function(notifications) {
              _(notifications).each(function(notification) {
                  if (notification.subject.type !== 'Issue') return;
                  $.ajax({
                      headers: {
                          'Content-Type': 'application/json',
                          'Accept': 'application/vnd.github.v3.html+json'
                      },
                      url: notification.subject.url + '?access_token=' + token,
                      type: 'GET',
                      success: function(issue) {
                          $.ajax({
                              headers: {
                                  'Content-Type': 'application/json',
                                  'Accept': 'application/vnd.github.v3.html+json'
                              },
                              url: issue.comments_url + '?access_token=' + token,
                              type: 'GET',
                              success: function(comments) {
                                  n.push({ notification: notification, issue: issue, comments: comments });
                                  if (!initial) {
                                      initial = true;
                                      show();
                                  }
                              }
                          });
                      }
                  });
              });
          }
      });
    }

    function prev() {
        idx--;
        show();
    }

    function next(save, mute) {
        var obj = n[idx];
        if (mute) {
            $.ajax({
                headers: {
                    'Content-Type': 'application/json'
                },
                url: 'https://api.github.com/notifications/threads/' + obj.notification.id + '/subscription?access_token=' + token,
                type: 'PUT',
                data: JSON.stringify({ignored: true})
            });
        } else if (!save) {
            $.ajax({
                headers: {
                    'Content-Type': 'application/json'
                },
                url: 'https://api.github.com/notifications/threads/' + obj.notification.id + '?access_token=' + token,
                type: 'PATCH'
            });
        }
        idx++;
        show();
        if (idx == n.length - 5) {
            load(++page);
        }
    }

    function show() {
        var template = _($('#template-item').text()).template();
        var obj = n[idx];
        var comment_id = obj.notification.subject.latest_comment_url.split('/').pop();
        $('#items').html(template(obj));
        if (obj.notification.subject.type == 'Issue' && obj.notification.last_read_at) {
            var id = 'issuecomment-' + _(obj.comments).find(function(comment) {
                return +new Date(obj.notification.last_read_at) < +new Date(comment.created_at);
            }).id;
            window.location.hash = 'issuecomment-' + _(obj.comments).find(function(comment) {
                return +new Date(obj.notification.last_read_at) < +new Date(comment.created_at);
            }).id;
            setTimeout(function() {
                $('html, body').animate({
                    scrollTop: $('#'+id).offset().top - 100
                }, 200);
            }, 200);
        } else {
            window.location.hash = '';
            $('html, body').animate({
                scrollTop: 0
            }, 200);
        }
    }

    $('body').on('keydown', function(e) {
        switch (e.keyCode) {
            case 74: next(e.shiftKey); break;
            case 75: prev(); break;
            case 77: next(false, true); break;
        }
    });

    $('.js-prev').on('click', function(e) {
      prev();
    });

    $('.js-next').on('click', function(e) {
      next(e.shiftKey);
    });

    $('#key-commands-toggle').click(function() {
        $(this).siblings().toggle();
        return false;
    });

   if ( $(window).width() < '700' ) {

        $('body').swipe( {
            swipeLeft:swipeBack,
            swipeRight:swipeForward,
            allowPageScroll:'auto'
        } );

        $('body').addClass('touchdevice');

        function swipeBack(event, direction) {
            prev();
        };

        function swipeForward(event, direction) {
            next();
        };

   }

});

function getCookie(name) {
  var parts = document.cookie.split(name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}
