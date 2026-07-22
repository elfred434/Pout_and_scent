from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0001_initial"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            CREATE OR REPLACE FUNCTION produit_search_vector_update() 
            RETURNS trigger AS $$
            BEGIN
                NEW.search_vector :=
                    setweight(to_tsvector('french', COALESCE(NEW.nom, '')), 'A') ||
                    setweight(to_tsvector('french', COALESCE(NEW.marque, '')), 'B') ||
                    setweight(to_tsvector('french', COALESCE(NEW.description, '')), 'C');
                RETURN NEW;
            END$$ LANGUAGE plpgsql;

            CREATE TRIGGER trg_produit_search_vector
            BEFORE INSERT OR UPDATE OF nom, marque, description
            ON catalog_produit
            FOR EACH ROW EXECUTE FUNCTION produit_search_vector_update();

            UPDATE catalog_produit SET nom = nom;
            """,
            reverse_sql="""
            DROP TRIGGER IF EXISTS trg_produit_search_vector ON catalog_produit;
            DROP FUNCTION IF EXISTS produit_search_vector_update();
            """
        ),
    ]