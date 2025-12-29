pipeline {
    agent any

    triggers {
        githubPush()
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/paula-sda/next-js-pokedex-25-26.git'
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Run Unit Tests') {
            steps {
                echo "Ejecutando tests unitarios..."
                sh 'npm test'
            }
        }

        stage('Deploy to DESA (simulado)') {
            steps {
                echo "=== Desplegando a entorno de Desarrollo (simulado) ==="
                sh 'echo Copiando build a /home/azureuser/DESA/'
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
                sh 'echo Copiando build a /home/azureuser/PRODUCCION/'
            }
        }
    }
}
