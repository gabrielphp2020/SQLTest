//import
Import("utils.js");
Import("sql-wasm.js");



function Import(file) {
    //source:http://www.forosdelweb.com/f13/importar-archivo-js-dentro-javascript-387358/
    document.write('<script language=\"JavaScript\" type=\"text/JavaScript\" src=' + file + '></script>');
}


class BD {


    //constructores

    constructor(idBD = "") {

            this.IdBD = idBD;
            this.Init = initSqlJs().then(SQL => {
                return new Promise((okey, error) => {
                    this._bd = new SQL.Database();
                    okey();
                });

            });

            if (this.IdBD != "") {
                this.Init = this.Init.then(() => this.Load(this.IdBD));
            } else {
                this.Init = this.Init.then(() => {
                    return new Promise((okey, error) => {
                        this.IdBD = BD.Header + new Date().getTime();
                        okey();
                    });
                });
            }
        }
        //static properties
    static get Header() {
        if (!BD._Header)
            BD._Header = "BDSQL";
        return BD._Header;
    }
    static set Header(header) {
        BD._Header = header;
    }


    static get CacheName() {
        return "BD.Name";
    }

    static get CacheData() {
        return "BD.Data";
    }


    //property
    get Name() {
        if (!this._name)
            this._name = "BD" + new Date().getTime();
        return this._name;
    }
    set Name(name) {
        this._name = name;

    }


    //metodos cargar/guardar
    Load(idBD) {
        return new Promise((okey, error) => {
            CacheUtils.GetByteArray(CacheData, idBD).then((data) => {


                this.Import(data).then(() => {

                    CacheUtils.GetString(CacheName, idBB).then((name) => {
                        this.Name = name;
                        okey(this);
                    });


                }).catch(error);


            }).catch(() => error("imposible load id='" + idBD + "' not found."));


        });
    }
    Save() {
        return new Promise((okey, error) => {
            this.Export()
                .then(data => {
                    //set data
                    CacheUtils.SetByteArray(CacheData, idBD, data).then(() => {
                        //set name
                        CacheUtils.SetString(CacheName, idBD, this.Name).then(() => {

                            okey(this);
                        })

                    });
                }).catch(error);
        });
    }
    Export() {
        return new Promise((okey, error) => okey(this._bd.export()).catch(error));
    }

    Import(dataBD) {
        return new Promise((okey, error) => initSqlJs().then(SQL => {
            this._bd = new SQL.Database(dataBD);
            okey(this);
        }).catch(error));
    }

    ExecuteURL(url, args, tratarRespuestaFetch = (r) => r.text()) {
            return fetch(url).then((result) => {
                if (result.ok)
                    return tratarRespuestaFetch(result);
                else throw "No se puede obtener url=" + url;
            }).then((data) => this.Execute(data, args));
        }
        //SQL
    Execute(strSQL, ...args) {
        return new Promise((okey, error) => okey(this._bd.exec(StringUtils.Format(strSQL, args))).catch(error));
    }

    Run(strSQL, ...args) {
        return new Promise((okey, error) => {

            try {
                this._bd.run(StringUtils.Format(strSQL, args));
                okey();
            } catch (ex) {
                error(ex);
            }
        });

    }
    Delete(tableName) {
        return this.Run("delete table " + tableName + ";");
    }
    Drop(tableName) {
        return this.Run("drop table " + tableName + ";");
    }
    Clone() {
            return new Promise((okey, error) => {
                var clon = new BD();
                this.Export().then(e => clon.Import(e))
                    .then(() => {
                        clon.Name = this.Name + "_Clon";
                        okey(clon);
                    }).catch(error);

            });
        }
        //cargar/guardar
    static LoadAll() {
        return new Promise((okey, error) => {
            CacheUtils.GetKeys(CacheData, BD.Header).then((keysFiltradas) => {
                var bds = [];
                var initBDS = [];
                for (var i = 0; i < keysFiltradas.length; i++) {

                    bds.push(new BD(keysFiltradas));
                    initBDS.push(bds[bds.length - 1].Init);

                }
                return Promise.all(initBDS).then(() => { return bds; });

            }).then(okey).catch(error);
        });



    }

    static SaveAll(...bds) {
        var savs = [];
        bds = ArrayUtils.Root(bds);
        for (var i = 0; i < bds.length; i++) {
            savs.push(bds[i].Save());
        }
        return Promise.all(savs);


    }
    static DeleteFromCache(...bds) {
        bds = ArrayUtils.Root(bds);
        promesas = [];
        for (var i = 0; i < bds.length; i++) {
            promesas.push(CacheUtils.Delete(BD.CacheData, bds[i].IdBD));
            promesas.push(CacheUtils.Delete(BD.CacheName, bds[i].IdBD));
        }
        return Promise.all(promesas);


    }


    //string result part
    static ResultToString(result) {
        var text = "";
        if (result.length != 0) {
            for (var j = 0; j < result.length; j++) {
                text += j + ":" + BD._filaToString(result[j].columns);
                for (i in result[j].values)
                    text += BD._filaToString(result[j].values[i]);
            }
        } else text = "No result from SQLite!";

        return text;
    }

    static _filaToString(array) {
        var fila = "";
        for (var i = 0; i < array.length; i++) {
            fila += "\t" + array[i];
        }
        fila += "\n";

        return fila;
    }

}