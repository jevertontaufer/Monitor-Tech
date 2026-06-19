/* ============================================================
   BANCO DE FORNECEDORES  —  edite à vontade
   ------------------------------------------------------------
   COMO ADICIONAR UM FORNECEDOR:
   copie uma linha abaixo, cole e troque os dados. Campos:
     nm      : nome do fornecedor
     pais    : país (texto livre — vira a etiqueta do cartão)
     cats    : categorias (use as chaves de CATEGORIAS; pode ter várias)
     tag     : descrição curta do que a empresa faz
     url     : site oficial (sempre com https://)
     contato : OPCIONAL — telefone, e-mail ou WhatsApp; aparece no cartão
               (deixe "" se não tiver; não invente dados)

   COMO CRIAR UMA CATEGORIA NOVA:
   adicione uma linha em CATEGORIAS (chave:"Rótulo") e use a chave em "cats".

   Depois de editar, basta subir este arquivo para o GitHub (mesma pasta).
   ============================================================ */

window.CATEGORIAS = {
  robos:       "Robôs & cobots",
  automacao:   "Automação & CLP/SCADA",
  agv:         "AGV / AMR",
  visao:       "Visão computacional",
  ia:          "IA industrial & software",
  sensores:    "Sensores & IIoT",
  aditiva:     "Manufatura aditiva (3D)",
  intralog:    "Armazenagem & intralogística",
  paletizacao: "Paletização & fim de linha",
  otsec:       "Cibersegurança industrial (OT)"
};

window.SUPPLIERS = [
  /* ---- Robôs & cobots ---- */
  {nm:"FANUC",               pais:"Japão",          cats:["robos","automacao","paletizacao"], tag:"Robôs industriais e células de paletização", url:"https://www.fanuc.com", contato:""},
  {nm:"Yaskawa (Motoman)",   pais:"Japão",          cats:["robos","automacao","paletizacao"], tag:"Robôs de paletização e drives",              url:"https://www.yaskawa.com", contato:""},
  {nm:"Kawasaki Robotics",   pais:"Japão",          cats:["robos","paletizacao"],             tag:"Robôs industriais de paletização",           url:"https://kawasakirobotics.com", contato:""},
  {nm:"ABB Robotics",        pais:"Suíça/Suécia",   cats:["robos","automacao","paletizacao"], tag:"Robôs e automação de paletização",           url:"https://new.abb.com/products/robotics", contato:""},
  {nm:"KUKA",                pais:"Alemanha",       cats:["robos","paletizacao"],             tag:"Robôs e células de paletização",             url:"https://www.kuka.com", contato:""},
  {nm:"Stäubli",             pais:"Suíça",          cats:["robos"],                           tag:"Robôs industriais de alta precisão",         url:"https://www.staubli.com", contato:""},
  {nm:"Mitsubishi Electric", pais:"Japão",          cats:["robos","automacao"],               tag:"Robôs e automação fabril (FA)",              url:"https://www.mitsubishielectric.com/fa/", contato:""},
  {nm:"Comau",               pais:"Itália",         cats:["robos"],                           tag:"Robôs industriais e automação",              url:"https://www.comau.com", contato:""},
  {nm:"Universal Robots",    pais:"Dinamarca",      cats:["robos","paletizacao"],             tag:"Cobots para paletização e manuseio",         url:"https://www.universal-robots.com", contato:""},
  {nm:"Doosan Robotics",     pais:"Coreia do Sul",  cats:["robos"],                           tag:"Robôs colaborativos (cobots)",               url:"https://www.doosanrobotics.com", contato:""},
  {nm:"Techman Robot",       pais:"Taiwan",         cats:["robos","visao"],                   tag:"Cobots com visão integrada",                 url:"https://www.tm-robot.com", contato:""},

  /* ---- Automação & CLP/SCADA/drives ---- */
  {nm:"Siemens",             pais:"Alemanha",       cats:["automacao","ia","sensores"],       tag:"CLP, SCADA, drives e software industrial",   url:"https://www.siemens.com", contato:""},
  {nm:"Rockwell Automation", pais:"EUA",            cats:["automacao","ia"],                  tag:"Allen-Bradley, controle e MES",              url:"https://www.rockwellautomation.com", contato:""},
  {nm:"Schneider Electric",  pais:"França",         cats:["automacao","ia"],                  tag:"Controle, energia e EcoStruxure",            url:"https://www.se.com", contato:""},
  {nm:"Bosch Rexroth",       pais:"Alemanha",       cats:["automacao"],                       tag:"Acionamentos, controle e hidráulica",        url:"https://www.boschrexroth.com", contato:""},
  {nm:"Beckhoff",            pais:"Alemanha",       cats:["automacao"],                       tag:"Automação baseada em PC (PC-based)",         url:"https://www.beckhoff.com", contato:""},
  {nm:"Phoenix Contact",     pais:"Alemanha",       cats:["automacao","sensores"],            tag:"Conectividade e controle industrial",        url:"https://www.phoenixcontact.com", contato:""},
  {nm:"Omron",               pais:"Japão",          cats:["automacao","robos","sensores","visao"], tag:"Automação, sensores, visão e robôs",     url:"https://www.omron.com", contato:""},
  {nm:"Emerson",             pais:"EUA",            cats:["automacao"],                       tag:"Automação de processos e válvulas",          url:"https://www.emerson.com", contato:""},
  {nm:"Yokogawa",            pais:"Japão",          cats:["automacao"],                       tag:"Controle de processos (DCS) e medição",      url:"https://www.yokogawa.com", contato:""},
  {nm:"WEG",                 pais:"Brasil",         cats:["automacao","robos"],               tag:"Motores, drives, CLP e automação",           url:"https://www.weg.net", contato:""},
  {nm:"Altus",               pais:"Brasil",         cats:["automacao"],                       tag:"CLPs e sistemas de controle (tecnologia BR)",url:"https://www.altus.com.br", contato:""},
  {nm:"HI Tecnologia",       pais:"Brasil",         cats:["automacao","sensores"],            tag:"CLPs e IIoT (Campinas/SP)",                  url:"https://www.hitecnologia.com.br", contato:""},

  /* ---- Visão computacional ---- */
  {nm:"Cognex",              pais:"EUA",            cats:["visao"],                           tag:"Visão de máquina e leitura de código",       url:"https://www.cognex.com", contato:""},
  {nm:"Keyence",             pais:"Japão",          cats:["visao","sensores"],                tag:"Sensores e sistemas de visão",               url:"https://www.keyence.com", contato:""},
  {nm:"Basler",              pais:"Alemanha",       cats:["visao"],                           tag:"Câmeras industriais",                        url:"https://www.baslerweb.com", contato:""},
  {nm:"SICK",                pais:"Alemanha",       cats:["visao","sensores"],                tag:"Sensores e visão industrial",                url:"https://www.sick.com", contato:""},
  {nm:"Teledyne",            pais:"EUA/Canadá",     cats:["visao"],                           tag:"Câmeras e visão (DALSA/FLIR)",               url:"https://www.teledyne.com", contato:""},
  {nm:"MVTec",               pais:"Alemanha",       cats:["visao","ia"],                      tag:"Software de visão (HALCON)",                 url:"https://www.mvtec.com", contato:""},
  {nm:"Zebra Technologies",  pais:"EUA",            cats:["visao","agv"],                     tag:"Leitura, visão fixa e robôs móveis",         url:"https://www.zebra.com", contato:""},

  /* ---- Sensores & IIoT ---- */
  {nm:"Pepperl+Fuchs",       pais:"Alemanha",       cats:["sensores"],                        tag:"Sensores e proteção (áreas classificadas)",  url:"https://www.pepperl-fuchs.com", contato:""},
  {nm:"IFM Electronic",      pais:"Alemanha",       cats:["sensores"],                        tag:"Sensores e conectividade IIoT",              url:"https://www.ifm.com", contato:""},
  {nm:"Balluff",             pais:"Alemanha",       cats:["sensores"],                        tag:"Sensores e identificação industrial",        url:"https://www.balluff.com", contato:""},
  {nm:"Turck",               pais:"Alemanha",       cats:["sensores"],                        tag:"Sensores e tecnologia de conexão",           url:"https://www.turck.com", contato:""},
  {nm:"Banner Engineering",  pais:"EUA",            cats:["sensores"],                        tag:"Sensores e indicadores industriais",         url:"https://www.bannerengineering.com", contato:""},
  {nm:"Endress+Hauser",      pais:"Suíça",          cats:["sensores","automacao"],            tag:"Instrumentação de processo",                 url:"https://www.endress.com", contato:""},

  /* ---- IA industrial & software ---- */
  {nm:"Tractian",            pais:"Brasil",         cats:["ia","sensores"],                   tag:"Manutenção preditiva com IA (sensores próprios)", url:"https://tractian.com", contato:""},
  {nm:"PTC",                 pais:"EUA",            cats:["ia"],                              tag:"IoT industrial e digital twin (ThingWorx)",  url:"https://www.ptc.com", contato:""},
  {nm:"AVEVA",               pais:"Reino Unido",    cats:["ia","automacao"],                  tag:"Software industrial e gêmeo digital",        url:"https://www.aveva.com", contato:""},
  {nm:"SAP",                 pais:"Alemanha",       cats:["ia"],                              tag:"Software de gestão e Indústria 4.0",         url:"https://www.sap.com", contato:""},
  {nm:"Cognite",             pais:"Noruega",        cats:["ia"],                              tag:"DataOps industrial e IA",                    url:"https://www.cognite.com", contato:""},
  {nm:"Augury",              pais:"EUA",            cats:["ia","sensores"],                   tag:"Saúde de máquinas com IA",                   url:"https://www.augury.com", contato:""},
  {nm:"Samsara",             pais:"EUA",            cats:["ia","sensores"],                   tag:"Operações conectadas (IoT)",                 url:"https://www.samsara.com", contato:""},
  {nm:"C3 AI",               pais:"EUA",            cats:["ia"],                              tag:"Aplicações de IA empresarial/industrial",    url:"https://c3.ai", contato:""},
  {nm:"NVIDIA",              pais:"EUA",            cats:["ia"],                              tag:"Computação e IA (Omniverse, edge)",          url:"https://www.nvidia.com", contato:""},

  /* ---- AGV / AMR ---- */
  {nm:"Mobile Industrial Robots (MiR)", pais:"Dinamarca", cats:["agv"],                       tag:"Robôs móveis autônomos (AMR)",               url:"https://www.mobile-industrial-robots.com", contato:""},
  {nm:"Geek+",               pais:"China",          cats:["agv","intralog"],                  tag:"Robôs móveis para logística",                url:"https://www.geekplus.com", contato:""},
  {nm:"Locus Robotics",      pais:"EUA",            cats:["agv","intralog"],                  tag:"AMR para separação de pedidos",              url:"https://www.locusrobotics.com", contato:""},
  {nm:"SEW-Eurodrive",       pais:"Alemanha",       cats:["agv","automacao"],                 tag:"Acionamentos e sistemas AGV",                url:"https://www.sew-eurodrive.com", contato:""},

  /* ---- Armazenagem & intralogística ---- */
  {nm:"Dematic",             pais:"Alemanha",       cats:["intralog","paletizacao","agv"],    tag:"Intralogística, AS/RS e paletização",        url:"https://www.dematic.com", contato:""},
  {nm:"TGW Logistics",       pais:"Áustria",        cats:["intralog","paletizacao"],          tag:"Automação de armazéns e paletização (Alvey)",url:"https://www.tgw-group.com", contato:""},
  {nm:"SSI Schäfer",         pais:"Alemanha",       cats:["intralog"],                        tag:"Sistemas de armazenagem automatizada",       url:"https://www.ssi-schaefer.com", contato:""},
  {nm:"Mecalux",             pais:"Espanha",        cats:["intralog"],                        tag:"Estruturas e AS/RS para armazéns",           url:"https://www.mecalux.com", contato:""},
  {nm:"Knapp",               pais:"Áustria",        cats:["intralog"],                        tag:"Automação de intralogística",                url:"https://www.knapp.com", contato:""},
  {nm:"Vanderlande",         pais:"Holanda",        cats:["intralog"],                        tag:"Manuseio de materiais e bagagem",            url:"https://www.vanderlande.com", contato:""},
  {nm:"Daifuku",             pais:"Japão",          cats:["intralog"],                        tag:"Sistemas de movimentação automatizada",      url:"https://www.daifuku.com", contato:""},

  /* ---- Paletização & fim de linha ---- */
  {nm:"Elettric80",          pais:"Itália",         cats:["paletizacao","agv"],               tag:"Linhas completas: paletização + AGV/LGV",    url:"https://www.elettric80.com", contato:""},
  {nm:"Concetti",            pais:"Itália",         cats:["paletizacao"],                     tag:"Ensaque e paletização (suporte no Brasil)",  url:"https://www.concetti.com", contato:""},
  {nm:"FlexLink (Coesia)",   pais:"Suécia",         cats:["paletizacao","robos"],             tag:"Paletização robótica e cobots",              url:"https://www.flexlink.com", contato:""},
  {nm:"Columbia/Okura",      pais:"EUA",            cats:["paletizacao"],                     tag:"Sistemas robóticos de paletização",          url:"https://columbiaokura.com", contato:""},
  {nm:"BW Integrated Systems",pais:"EUA",           cats:["paletizacao"],                     tag:"Paletizadores convencionais e robóticos",    url:"https://www.bwintegratedsystems.com", contato:""},
  {nm:"Premier Tech",        pais:"Canadá",         cats:["paletizacao"],                     tag:"Ensaque e paletização",                      url:"https://www.premiertech.com", contato:""},
  {nm:"SEE Sistemas",        pais:"Brasil",         cats:["paletizacao","robos"],             tag:"Integrador de paletização robótica",         url:"https://www.seesistemas.com.br", contato:""},
  {nm:"Ferraz Máquinas",     pais:"Brasil",         cats:["paletizacao"],                     tag:"Linhas de paletização robotizada (Ribeirão Preto/SP)", url:"https://www.ferrazmaquinas.com.br", contato:""},
  {nm:"ARV Systems",         pais:"Brasil",         cats:["paletizacao","robos","automacao"], tag:"Integrador de automação e paletização",      url:"https://www.arvsystems.com.br", contato:""},

  /* ---- Manufatura aditiva (3D) ---- */
  {nm:"Stratasys",           pais:"EUA/Israel",     cats:["aditiva"],                         tag:"Impressão 3D industrial (polímeros)",        url:"https://www.stratasys.com", contato:""},
  {nm:"3D Systems",          pais:"EUA",            cats:["aditiva"],                         tag:"Manufatura aditiva (polímero e metal)",      url:"https://www.3dsystems.com", contato:""},
  {nm:"EOS",                 pais:"Alemanha",       cats:["aditiva"],                         tag:"Sinterização a laser (metal/polímero)",      url:"https://www.eos.info", contato:""},
  {nm:"Markforged",          pais:"EUA",            cats:["aditiva"],                         tag:"Impressão 3D de peças funcionais",           url:"https://www.markforged.com", contato:""},
  {nm:"TRUMPF",              pais:"Alemanha",       cats:["aditiva","automacao"],             tag:"Laser, máquinas e manufatura aditiva",       url:"https://www.trumpf.com", contato:""},
  {nm:"Desktop Metal",       pais:"EUA",            cats:["aditiva"],                         tag:"Impressão 3D de metal em escala",            url:"https://www.desktopmetal.com", contato:""},

  /* ---- Cibersegurança industrial (OT) ---- */
  {nm:"Claroty",             pais:"EUA/Israel",     cats:["otsec"],                           tag:"Proteção de redes OT/ICS",                   url:"https://www.claroty.com", contato:""},
  {nm:"Nozomi Networks",     pais:"EUA",            cats:["otsec"],                           tag:"Visibilidade e segurança OT/IoT",            url:"https://www.nozominetworks.com", contato:""},
  {nm:"Dragos",              pais:"EUA",            cats:["otsec"],                           tag:"Segurança e resposta para ICS",              url:"https://www.dragos.com", contato:""},
  {nm:"TXOne Networks",      pais:"Taiwan",         cats:["otsec"],                           tag:"Segurança OT (chão de fábrica)",             url:"https://www.txone.com", contato:""},
  {nm:"Fortinet",            pais:"EUA",            cats:["otsec"],                           tag:"Segurança de rede (TI/OT)",                  url:"https://www.fortinet.com", contato:""}
];
