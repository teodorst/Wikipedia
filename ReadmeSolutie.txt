In primul rand as dori sa imi cer scuze pentru ca am interziat in a trimite
solutia.

Am implementat serverul si scriptul in nodejs si python.

La ambele aplicatii am incercat sa pastrez aceeasi arhitectura.

client -> REST_API -> BusinessLogic (Servicii/Scripturi) -> Stores -> DB (fizic)

Organizarea bazei de date:

Am presupun ca avem o nastere/eveniment/moarte/vacanta la 1 saptamana.
Nr total de posibile valori returnate = 2016 * 4 * 12 * 31 / 7 = 428544


Din cate am citit, mongodb se misca binisor pana la 3mil de colectii si
pentru fiecare colectie suporta ok cam 500k de documente.


Caz I: Colectiilor sunt de forma Luna_An => 24192 colectii.
    In 16 mb incap aproape 24000 de antete de colectii, fisier care oricum este
    alocat pe fiecare baza de date. Cred ca totusi o problema o reprezinta
    fiecare adaugare/cautare, deoarece chit ca si colectiile sunt indexate, tot
    este un spatiu de cautare cam mare. Luand in considerare presupunerea
    facuta, am avea aproape 20 documente per colectie. Nu este prea avantajos.


Caz II: Colectii de forma: categorie
    Avem 4 colectii, pentru fiecare cateogie. Numarul de documente per colectie
    poate sa fie maxim ~= 107k. Conform surselor de pe stackoverflow, baza de
    date este ok cu numarul acesta. Spatiul de cautare cred ca este cel mai bine
    redus asa.

Caz III: Categorie_an:
  Nr total de colectii este 8064. Documente per colectie: 53.

Nu stiu care dintre Cazul II si Cazul III este mai bun dar eu am ales cazul II.

In final pentru cele 4 colectii au:
  Births: 86286
  Deaths: 36679
  Events: 18845
  Holidays: 5289

    Prin urmarea baza de date este compusa din 4 colectii, fiecare colectie, este
indexata ascendent dupa titlu, care are si proprietatea de unicitate. Am
folosit createIndex pentru asta.

Ca si imagine de docker, am folosit-o pe cea de la tutum, pe DockerHub.
(tutum/mongodb)


Nodejs:
    Am facut 2 scripturi, unul care nu are control asupra flow-ului, lanseaza
toate call-urile pentru pagini, urmand ca in momentul cand una este descarcata,
sa se apeleze callback-ul pentru parsarea ei.
    Cel de al 2lea script, downloadeaza pe rand paginile, flow-ul fiind controlat
prin promises. La fiecare pagina pe care o parsez, am un array de promisuri,
compus din scrierile in baza de date. Cand acestea se termina pentru o pagina,
atunci emit un eveniment pentru aducerea urmatoarei paginii.

    Avantajul primului script este, ca nu mai sincronizeaza scrierile, dar nici
nu poate afisa cand se terminat etapa de fetch, pe cand al doilea este putin
mai lent, dar afiseaza progresul.

    Pentru a se rula o data la 2 ore, am folosit setInterval.

    Pentru parsarea liniilor, am folosit regex-uri simple. Daca este de
forma ==[cuvinte]==, atunci este categorie, daca este de forma '*[[[cifre]]]
&ndash;' sau '*  [cifre]  &ndash; ', atunci este o intrare specifica categoriei
curent, iar data este de forma '*', '**', '***', urmat de text, atunci este, o
intrare aferenta categoriei Holidays and Observances.

    Pentru partea de query-uri, am facut un obiect pe baza queryParams-urilor
care imi sunt trimise, si apelez un find() pe categorie/toate categoriile.

    Pentru a rezolva problema, fetch-ului in cazul in care baza de date, are deja
continut, am preferat sa nu sterg inainte, si apoi sa fac fetch, deoarecere
poate sa cada serverul wikipedia, si atunci eu nu mai am nici o data. Asa ca am
folosit un update cu parametrul upset:True, pentru a adauga documentul daca
acesta nu a fost gasit in colectie. Sunt constient ca imi reduce viteza, dar nu
pot risca sa raman fara un set de date valid. O solutie ar mai fi sa fac o copie
 a bazei de date, o data pe zi/saptamana.

    Am facut docker-compose-ul, care presupune rularea unei bazei de date si a
serverului + scriptului in containere diferite.


Python:
    Baza de date este singleton, iar in rest am incercat sa mentin aceeasi
arhitectura la nivelul server-ului web.
    Am facut un singur script si am incercat sa respect paradigma master-worker.
    Din server(thread-ul 0), pornesc un thread(master, in cazul nostru),
care apelezeaza fetchDB si doarme 2h. Cand apeleaza fetchDB, thread_masterul
porneste la randul lui inca 4 thread-workers, care aduc paginile.
    Fiecare thread_worker aduce paginile thread_id, thread_id + numThreads,
thread_id + 2 * numThread ... . Dupa ce fiecare thread_worker, a adus si
parsat(acelasi algoritm ca in cazul nodejs) paginile, este asteptat de
thread-ul_master. Cand toti workerii au terminat, atunci masterul doarme 2h.

  *Pentru parsare am folosit modulul re, si pot spune ca este mult mai usor si
frumos decat regex-urile din node.

  Pentru server am folosit, Flask cu parametrul de rulare pe mai multe threaduri
activat. Pentru partea de query-ing al bazei de date, am facut la fel, un
dictionar cu parametrii pe care ii primesc, si apelez find.

Si pentru python am facut docker-compose.

Teste de perfomanta:
DB gol:
  Nodejs: 223.393 secunde
  Python: 79.791 secunde

DB plin:
  Nodejs: 217.178 secunde
  Python: 73.846 secunde


Va multumesc din nou pentru "tema", a fost foarte interesanta si ca o prima
imbunatatire, dupa ce se face fetch la baza de date, se sterg toate entitatile
care au data adaugarii mai mica decat ultima data cand a fost fetch-uita baza
de date. Am folosit un fisier de log pentru asta, numit timelog.txt. 
