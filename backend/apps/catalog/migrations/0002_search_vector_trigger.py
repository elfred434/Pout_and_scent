"""
Migration : Trigger PostgreSQL pour le search_vector.
Ne s'exécute QUE sur PostgreSQL (pas compatible SQLite).
"""
from django.db import migrations, connection


def apply_search_trigger(apps, schema_editor):
    """Applique le trigger uniquement sur PostgreSQL."""
    if connection.vendor != "postgresql":
        return

    with schema_editor.connection.cursor() as cursor:
        cursor.execute("""
            CREATE OR REPLACE FUNCTION produit_search_vector_update() 
            RETURNS trigger AS $$
            BEGIN
                NEW.search_vector :=
                    setweight(to_tsvector('french', COALESCE(NEW.nom, '')), 'A') ||
                    setweight(to_tsvector('french', COALESCE(NEW.marque, '')), 'B') ||
                    setweight(to_tsvector('french', COALESCE(NEW.description, '')), 'C');
                RETURN NEW;
            END$$ LANGUAGE plpgsql;
        """)
        cursor.execute("""
            CREATE TRIGGER trg_produit_search_vector
            BEFORE INSERT OR UPDATE OF nom, marque, description
            ON catalog_produit
            FOR EACH ROW EXECUTE FUNCTION produit_search_vector_update();
        """)
        cursor.execute("UPDATE catalog_produit SET nom = nom;")


def reverse_search_trigger(apps, schema_editor):
    """Supprime le trigger uniquement sur PostgreSQL."""
    if connection.vendor != "postgresql":
        return

    with schema_editor.connection.cursor() as cursor:
        cursor.execute("DROP TRIGGER IF EXISTS trg_produit_search_vector ON catalog_produit;")
        cursor.execute("DROP FUNCTION IF EXISTS produit_search_vector_update();")


class Migration(migrations.Migration):

    dependencies = [
        ("catalog", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(
            apply_search_trigger,
            reverse_search_trigger,
        ),
    ]
