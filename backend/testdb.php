<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = 'localhost';
$user = 'root';
$password = '';
$database = 'smartplanningai';

echo "Tentative de connexion à la base de données MySQL...\n";

try {
    $conn = new mysqli($host, $user, $password);
    
    // Vérifier la connexion
    if ($conn->connect_error) {
        die("Échec de la connexion : " . $conn->connect_error . "\n");
    }
    
    echo "Connexion à MySQL réussie!\n";
    
    // Vérifier si la base de données existe
    $result = $conn->query("SHOW DATABASES LIKE '$database'");
    
    if ($result->num_rows > 0) {
        echo "La base de données '$database' existe.\n";
        
        // Sélectionner la base de données
        $conn->select_db($database);
        
        // Vérifier les tables
        $tables = $conn->query("SHOW TABLES");
        echo "Tables dans la base de données '$database':\n";
        
        if ($tables->num_rows > 0) {
            while ($table = $tables->fetch_array()) {
                echo " - " . $table[0] . "\n";
            }
        } else {
            echo "Aucune table trouvée.\n";
        }
    } else {
        echo "La base de données '$database' n'existe pas. Création...\n";
        
        if ($conn->query("CREATE DATABASE IF NOT EXISTS $database")) {
            echo "Base de données '$database' créée avec succès.\n";
        } else {
            echo "Erreur lors de la création de la base de données : " . $conn->error . "\n";
        }
    }
    
    $conn->close();
} catch (Exception $e) {
    echo "Erreur : " . $e->getMessage() . "\n";
}
?> 