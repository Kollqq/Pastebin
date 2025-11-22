from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("pastes", "0004_paste_admin_removal_comment_paste_admin_removed_at_and_more"),
    ]

    operations = [
        migrations.DeleteModel(
            name="Comment",
        ),
    ]
