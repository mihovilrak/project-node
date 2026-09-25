# Users and roles

Administrators create accounts, assign roles and control what each role may do. This page covers managing users, managing roles and the default permissions.

Everything on this page requires the **Admin** permission. The **Users** and **Settings** tabs in the app bar are shown only to administrators, and the API rejects these calls from anyone else.

![User Management](/screenshots/users.png)

## Add a user

1. Select **Users** in the app bar, then **Add New User**. You can also use **Create User** under **Settings** > **Users**.
2. Enter **Login**, **First Name**, **Last Name** and **Email**.
3. Pick a **Role**. There is no default, so the form cannot be saved until you choose one.
4. Enter a **Password** and **Confirm Password**. Passwords need at least 12 characters with a lowercase letter, an uppercase letter, a digit and a special character.
5. Save. The account is created **Active**.

Send the user their login and password through a channel you trust. They can change the password from their profile.

## Edit a user

1. On **Users**, select the edit icon on the user.
2. Change the fields you need. Leave the password fields empty to keep the current password.
3. Save.

Setting a new password signs the user out of every session.

## Deactivate a user

Deactivating blocks sign-in and keeps the user's data.

1. Open **Settings** > **Users**.
2. Select the **Deactivate** icon on the user.
3. Confirm.

The user's sessions end at once. Their next request is rejected and they are sent to the sign-in page. An inactive user holds no permissions. Your own row has no status or delete controls, so you cannot deactivate or delete yourself.

To reactivate, select the **Activate** icon on the user. No confirmation is needed. This also restores a deleted user.

## Delete a user

1. On **Users**, select the delete icon on the user.
2. Confirm.

Deleting sets the status to **Deleted** and ends the user's sessions. Their tasks, comments and time logs stay. You cannot delete your own account.

## Manage roles

1. Open **Settings** > **Types & Roles** > **Roles**.
2. Select **Add Role**, or the edit icon on an existing role.
3. Enter a **Name** and optionally a **Description**.
4. Tick the permissions the role grants. See the [permissions matrix](#permissions-matrix).
5. Set **Active** and save.

Rules:

- An inactive role grants nothing to its users.
- A role cannot be deleted while users hold it. Move those users to another role first.
- The **Admin** role cannot be deleted, renamed, deactivated or lose the **Admin** permission. It is the way back in if other roles are misconfigured.

## Permissions matrix

Default roles and the permissions they grant:

| Permission | Admin | Project manager | Developer | Reporter |
| --- | :-: | :-: | :-: | :-: |
| Admin | ✓ | | | |
| Create projects | ✓ | ✓ | | |
| Edit projects | ✓ | ✓ | | |
| Delete projects | ✓ | ✓ | | |
| Create tasks | ✓ | ✓ | ✓ | |
| Edit tasks | ✓ | ✓ | ✓ | |
| Delete tasks | ✓ | ✓ | ✓ | |
| Log time | ✓ | ✓ | ✓ | ✓ |
| Edit log | ✓ | ✓ | ✓ | |
| Delete log | ✓ | ✓ | ✓ | |
| Delete files | ✓ | ✓ | | |

How permissions combine with access:

- **Admin** implies every other permission and grants access to every project.
- Everyone else works only inside projects they are a member of or created. See [Projects](/guide/projects#manage-members).
- Comments need no permission, only project access. Authors edit and delete their own comments.
- **Edit log** and **Delete log** apply to the user's own time logs only.
- Uploading files needs only project access. Deleting them needs **Delete files**.
