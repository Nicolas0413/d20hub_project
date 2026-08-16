from django.db import migrations


def remover_duplicatas(apps, schema_editor):
    FichaSessao = apps.get_model('sessoes', 'FichaSessao')
    seen = set()
    for item in FichaSessao.objects.order_by('id'):
        chave = (item.sala_id, item.ficha_id)
        if chave in seen:
            item.delete()
        else:
            seen.add(chave)


class Migration(migrations.Migration):

    dependencies = [
        ('sessoes', '0004_alter_fichasessao_id_alter_sala_id'),
    ]

    operations = [
        migrations.RunPython(remover_duplicatas, migrations.RunPython.noop),
        migrations.AlterUniqueTogether(
            name='fichasessao',
            unique_together={('sala', 'ficha')},
        ),
    ]
