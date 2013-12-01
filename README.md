The fastest way to read a ton of GitHub notifications.

## Set it up

It currently requires you to manually provide a valid GitHub OAuth token at the
top of site.js.

## Use it

Run it with a webserver like [serve](https://github.com/visionmedia/serve) or
jekyll and load index.html in your browser.

- `j` marks the current thread as read and moves to the next one
- `shift` + `j` leaves the current thread unread and moves to the next one
- `m` mutes the current thread and moves to the next one
- `k` moves to the previous thread (even if it was marked as read)

