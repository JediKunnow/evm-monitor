import { Database } from './';

export abstract class Migration {
    order: number | undefined;
    name: string | undefined;
    abstract get query() :string;
}

export class Migrator {

    static run(db: Database, migrations: Migration[]): void{

        migrations.sort((a,b) => { 
            if(!a.order || !b.order) return 0;
            return a.order - b.order;
        }).map(async m => { 
            console.log("Migrating " + m.name);
            db.query( m.query ).then(r => console.log);
        });
        console.log("Migrations Done.")
    }
}