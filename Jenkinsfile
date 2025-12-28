pipeline {
    agent any

    triggers {
        githubPush() // Trigger automático al hacer push
    }

    environment {
        // Nombre de tu servidor SonarQube configurado en Jenkins → Manage Jenkins → Configure System
        SONARQUBE = 'MySonarQubeServer'
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


       stage('SonarQube Analysis') {
    steps {
        withSonarQubeEnv('SonarQube Local') {
            bat 'sonar-scanner -Dsonar.projectKey=pokedex -Dsonar.sources=.'
        }
    }
}


        stage('Wait for Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Deploy to DESA (simulado)') {
            steps {
                echo "=== Desplegando a entorno de Desarrollo (simulado) ==="
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
                bat 'echo Copiando build a carpeta de PRODUCCIÓN...'
            }
        }
    }
}
