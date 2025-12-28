pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/paula-sda/next-js-pokedex-25-26.git'
            }
        }

        stage('Install dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Build') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Run Unit Tests') {
            steps {
                echo "Ejecutando tests unitarios..."
                bat 'npm test'
            }
        }

        stage('Deploy to DESA (simulado)') {
            steps {
                echo "=== Desplegando a entorno de Desarrollo (simulado) ==="
                // Aquí puedes simular copiar la build o hacer lo que quieras para DESA
                bat 'echo Copiando build a carpeta de DESA...'
            }
        }

        stage('Approval before PROD') {
            steps {
                input message: '¿Deseas desplegar a PRODUCCIÓN?'
            }
        }

        stage('Deploy to PROD (simulado)') {
            steps {
                echo "=== Desplegando a Producción (simulado) ==="
                // Simulación de despliegue
                bat 'echo Copiando build a carpeta de PRODUCCIÓN...'
            }
        }
    }
}
