import * as ldap from 'ldapjs';
import Config from '../config/index';

class Ldap {
    private ldap: any;

    constructor() {

    }

    client(url: string = Config.ldap.connect):Ldap {
        this.ldap = ldap.createClient({url});
        return this;
    }

    unbind(): void {
        this.ldap.unbind();
    }

    bind({username, password}: { username: string; password: string }): Promise<any> {
        return new Promise(async resolve => {
            this.ldap.bind(`YEALINK\\${username}`, password, err => {
                this.unbind();
                if (err) {
                    resolve();
                } else {
                    resolve({username, password, name: username});
                }
            });
            setTimeout(() => {
                this.unbind();
                resolve();
                console.error('LDAP链接超时');
            }, 3000);
        });
    }
}

export default Ldap;
