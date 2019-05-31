//L'application requiert l'utilisation du module Express.
//La variable express nous permettra d'utiliser les fonctionnalités du module Express.  
var express = require('express');
 
// Nous définissons ici les paramètres du serveur.
var hostname = 'localhost'; 
var port = 3000; 
 
// La variable mongoose nous permettra d'utiliser les fonctionnalités du module mongoose.
var mongoose = require('mongoose'); 
// Ces options sont recommandées par mLab pour une connexion à la base
var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }, 
replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };
 
//URL de notre base
var urlmongo = "mongodb://127.0.0.1:27017/restfrugaldb"; 
 
// Nous connectons l'API à notre base de données
mongoose.connect(urlmongo, options);
 
var db = mongoose.connection; 
db.on('error', console.error.bind(console, 'Erreur lors de la connexion')); 
db.once('open', function (){
    console.log("Connexion à la base OK"); 
}); 
 
// Nous créons un objet de type Express. 
var app = express(); 
 
var bodyParser = require("body-parser"); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
 
// Pour modéliser les données, le framework mongoose utilise des "schémas" ; nous créons donc un modèle de données :
var piscineSchema = mongoose.Schema({
    nom: String, 
    adresse: String, 
    tel: String, 
    description: String   
}); 
 
var Piscine = mongoose.model('Piscine', piscineSchema);
//Afin de faciliter le routage (les URL que nous souhaitons prendre en charge dans notre API), nous créons un objet Router.
//C'est à partir de cet objet myRouter, que nous allons implémenter les méthodes. 
var myRouter = express.Router(); 
 
// Je vous rappelle notre route (/piscines).  
myRouter.route('/piscines')
// J'implémente les méthodes GET, PUT, UPDATE et DELETE
// GET
.get(function(req,res){ 
    // Utilisation de notre schéma Piscine pour interrogation de la base
        Piscine.find(function(err, piscines){
            if (err){
                res.send(err); 
            }
            res.json(piscines); 
            })
    })
//POST
.post(function(req,res){
    // Nous utilisons le schéma Piscine
      var piscine = new Piscine();
    // Nous récupérons les données reçues pour les ajouter à l'objet Piscine
      piscine.nom = req.body.nom;
      piscine.adresse = req.body.adresse;
      piscine.tel = req.body.tel;
      piscine.description = req.body.description; 
    //Nous stockons l'objet en base
      piscine.save(function(err){
        if(err){
          res.send(err);
        }
        res.send({message : 'Bravo, la piscine est maintenant stockée en base de données'});
      })
})
//PUT
.put(function(req,res){ 
      res.json({message : "Mise à jour des informations d'une piscine dans la liste", methode : req.method});
})
//DELETE
.delete(function(req,res){ 
res.json({message : "Suppression d'une piscine dans la liste", methode : req.method});  
}); 
 
myRouter.route('/')
// all permet de prendre en charge toutes les méthodes. 
.all(function(req,res){ 
      res.json({message : "Bienvenue sur notre Frugal API ", methode : req.method});
});

myRouter.route('/piscines/:piscine_id')
.get(function(req,res){ 
            //Mongoose prévoit une fonction pour la recherche d'un document par son identifiant
            Piscine.findById(req.params.piscine_id, function(err, piscine) {
            if (err)
                res.send(err);
            res.json(piscine);
        });
})
.put(function(req,res){ 
    // On commence par rechercher la piscine souhaitée
                Piscine.findById(req.params.piscine_id, function(err, piscine) {
                if (err){
                    res.send(err);
                }
                    // Mise à jour des données de la piscine
                        piscine.nom = req.body.nom;
                        piscine.adresse = req.body.adresse;
                        piscine.tel = req.body.tel;
                        piscine.description = req.body.description; 
                              piscine.save(function(err){
                                if(err){
                                  res.send(err);
                                }
                                // Si tout est ok
                                res.json({message : 'Bravo, mise à jour des données OK'});
                              });                
                });
})
.delete(function(req,res){ 
 
    Piscine.remove({_id: req.params.piscine_id}, function(err, piscine){
        if (err){
            res.send(err); 
        }
        res.json({message:"Bravo, piscine supprimée"}); 
    }); 
    
});
// Nous demandons à l'application d'utiliser notre routeur
app.use(myRouter);  

// Démarrer le serveur 
app.listen(port, hostname, function(){
	console.log("Mon serveur fonctionne sur http://"+ hostname +":"+port); 
});