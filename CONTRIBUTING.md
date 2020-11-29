# Contributing

This repository welcomes all contributions, whether it is a typo fix or a breaking change, or a performance issue. Here are the steps for contributing:

## Issues

If you have found a bug in the repository or think there can be an enhancement, go to the `Issues` panel in the top left:
![Issues Panel](/img/issues.png)
In the top right there will be an option to create an issue

## Pull Request

Pull requests allow you to suggest new changes that can be typo fixes to breaking changes. There are multiple ways of creating pull requests.

### Minor Changes

If you are simply deleting, renaming, creating, or modifying a file:

- View that file inside `Github`
- Click on the edit icon in the top right to edit the file:
  ![Edit Icon](img/edit.png)
- This will automatically fork the repository and create a `patch-ID` branch where `ID` will be the number of the next `patch` branch available. Make your changes then press the `Propose Changes` button:
  ![Propose Changes](img/propose.png)
- Now you can review your changes and create a pull request, it will soon be reviewed by a maintainer

### Major Changes

When proposing major changes, the above method can be inefficient and tiring. The `GitHub` IDE doesn't have the best features possible. In these scenarios, making your changes locally will be the best option. Locally, you can also run the extension and the web app in development mode. Here are the steps for making major changes:

- Make sure you have `git`, `google-chrome`, `npm`, and `node` installed. At times, `nvm` also helps (NOTE: `nvm` is not required)
- Fork the repository by clicking on the button on the top right labeled "Fork":
  ![Fork](img/fork.png)
- Now copy the link to your codebase:
  ![Copy Link](img/copyURL.gif)
- Inside the terminal, run: `git clone URL` and replace `URL` with the URL that you previously copied
- Make your changes from your choice's code editor
- Once you are done, run `git add .` and `git commit -m MSG` replacing `MSG` with your commit message
- Now you can go ahead and run `git push` to push the changes to **your fork** of the repository
- We are not done yet! The changes are only on your fork. To create a pull request on the repository, click on the pull request button underneath the "Code" option shown in the previous GIF
- Now you can write out your elaborated pull request message and click on "Create Pull Request"
- Your PR will soon be reviewed
