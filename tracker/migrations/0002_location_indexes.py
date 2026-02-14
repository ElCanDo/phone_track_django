from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("tracker", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="locationlog",
            name="captured_at",
            field=models.DateTimeField(db_index=True),
        ),
        migrations.AddIndex(
            model_name="locationlog",
            index=models.Index(fields=["device", "captured_at"], name="trk_dev_cap_idx"),
        ),
    ]
