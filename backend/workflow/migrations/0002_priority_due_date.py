from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("workflow", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="workflowitem",
            name="priority",
            field=models.CharField(
                choices=[("low", "Low"), ("medium", "Medium"), ("high", "High")], default="medium", max_length=10
            ),
        ),
        migrations.AddField(
            model_name="workflowitem",
            name="due_date",
            field=models.DateField(blank=True, null=True),
        ),
    ]
