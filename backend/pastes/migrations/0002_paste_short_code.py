from django.db import migrations, models
import pastes.models


def generate_codes(apps, schema_editor):
    Paste = apps.get_model('pastes', 'Paste')
    for paste in Paste.objects.all():
        if not paste.short_code:
            paste.short_code = pastes.models._generate_short_code()
            paste.save(update_fields=["short_code"])


class Migration(migrations.Migration):

    dependencies = [
        ('pastes', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='paste',
            name='short_code',
            field=models.CharField(editable=False, max_length=12, unique=True, null=True),
        ),
        migrations.RunPython(generate_codes, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='paste',
            name='short_code',
            field=models.CharField(editable=False, max_length=12, unique=True),
        ),
    ]
