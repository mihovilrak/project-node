# Time tracking

Log the hours you spend on tasks so projects can compare estimated and spent time. This page covers logging, editing and reviewing time.

## Log time

Requires **Log time** and access to the task's project.

1. Open a task and, under **Time Logs**, select **Log Time**. You can also use **Log Time** on a project's **Time Log** tab.
2. Pick the **Project** and **Task** if they are not already set.
3. Set the **Log Date**.
4. Enter **Time Spent** in hours. Use the **+** / **-** buttons to step by 0.25 h. The value must be above 0 and at most 24.
5. Pick an **Activity Type**, for example Development, Meeting or Code Review.
6. Optionally add a **Description**, then save.

Time is logged against your own account. Administrators also see a **User** field and can log or reassign time for any active member of the task's project. It defaults to the administrator.

![A task's time logs](/screenshots/time-logs.png)

## Edit or delete a time log

Editing requires **Edit log**. Deleting requires **Delete log**.

1. Find the entry in the task's **Time Logs** or the project's **Time Log** tab.
2. Select the edit or delete icon on the entry.

You can only change your own entries. Administrators can change anyone's.

## Review time

- **Task page**: the header shows estimated and spent time; **Time Logs** lists each entry.
- **Project Overview**: estimated and spent time across all the project's tasks.
- **Project Time Log tab**: every entry for the project.
- **Project time calendar**: on the project's **Time Log** tab, select **Calendar view** to see hours per day for a month, with a **Total Time Spent** figure.
- **Profile**: **Hours Logged** shows your total.

Administrators can pull a cross-user report through the API. See [Settings](/admin/settings#time-log-report).
