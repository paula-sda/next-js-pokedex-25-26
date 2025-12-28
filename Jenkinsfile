pipeline {
    agent any

    // Trigger automático al hacer push en GitHub
    triggers {
        githubPush()
    }

    environment {
        // Nombre de la herramienta NodeJS registrada en Jenkins
        NODEJS_HOME = tool name: 'NodeJS', type: 'NodeJS'
        PATH = "${NODEJS_HOME}/bin:${env.PATH}"
        // Instancia de SonarQube registrada en Jenkins
        SONARQUBE = 'SonarQubeLocal'
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
                withSonarQubeEnv('SonarQubeLocal') {
                    echo "Ejecutando análisis SonarQube..."
                    bat 'sonar-scanner'
                }
            }
        }

        stage('Quality Gate') {
            steps {
                // Espera el resultado del Quality Gate de Sonar
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
