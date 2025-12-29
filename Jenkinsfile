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

        stage('Build & Export') {
            steps {
                sh 'npm run build'
                sh 'npm run export'  // genera la carpeta 'out'
            }
        }

        stage('Deploy to DESA') {
            steps {
                echo "=== Desplegando a entorno de Desarrollo ==="
                sh 'rm -rf /var/www/desa/*'
                sh 'cp -r out/* /var/www/desa/'
                sh 'ls -l /var/www/desa'  
            }
        }

        stage('Approval before PROD') {
            steps {
                input message: '¿Deseas desplegar a PRODUCCIÓN?'
            }
        }

        stage('Deploy to PROD') {
            steps {
                echo "=== Desplegando a Producción ==="
                sh 'rm -rf /var/www/prod/*'
                sh 'cp -r out/* /var/www/prod/'
                sh 'ls -l /var/www/prod'  
            }
        }
    }
}
