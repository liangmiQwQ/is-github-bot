# `is-github-bot` chrome extension

We provide a browser extension for Chrome users. It only have effects for some specific pages on https://github.com/

## Enhancements

We cache each user's status for 15 days.

### Avatar outline

We call `isGitHubBot` and add an outline for the author of a PR / issue, and account's detail page.

Human: `#16a34a7f`
Suspicious: `#eab3087f`
Bot: `#ef44447f`

Only effect on these pages:

- https://github.com/[owner_name]/[repo_name]/pull/[number] (1px outline, only for PR author, skip GitHub app bot)
- https://github.com/[owner_name]/[repo_name]/issues/[number] (1px outline, only for Issue author, skip GitHub app bot)
- https://github.com/[account_name] (2 px outline, do not effect on organization)

### Easier `Close as spam`

Add two buttons `Close as spam` and `Close and Block` before the buttons `Close issue` or `Close pull request` for bot author's PRs / issues.

`Close as spam` will automatically add a comment to the issue / pr, and `Close and Block` can block the user at the same time.

Only effect on these pages:

- https://github.com/[owner_name]/[repo_name]/pull/[number] (Skip GitHub app bot)
- https://github.com/[owner_name]/[repo_name]/issues/[number] (Skip GitHub app bot)

## Settings

We provide a single setting page, includes these options.

1. Check the author of pr / issue (Default: on)
   1. Skip checking for `collaborator`, `member` (Default: on)
   2. Skip checking for `contributor` (Default: off)
   3. Show `Close as spam` and `Close and Block` button for bot (Default: on)
      1. Prompt for clicking `Close as spam` (Allow to use ${username}, leave blank to say nothing)
      2. Prompt for clicking `Close and Block` (Allow to use ${username}, leave blank to say nothing)
2. Check the author of pr / issue (Default: on)
   1. Show `Block` button for bot (Default: off)
3. GitHub Token (Optional)

We use Vue3, TypeScript, UnoCSS to build setting page. We use flex, center layout as basically layout. Use `slate` as primary color. Use `@iconify-json/ph` for icons. UI should be similar to website's one.
