pipeline {
    agent any

    triggers {
        githubPush() 
    }

    tools {
        sonarScanner "sonarqube" // Ajusta al nombre del Scanner en Jenkins Global Tool Configuration
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

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('jenkinsSonar') {
                    // Esto usa el SonarScanner del plugin de Jenkins
                    sh """
                        sonar-scanner \
                        -Dsonar.projectKey=sonarPipeline \
                        -Dsonar.projectName='sonarPipeline' \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://172.174.241.22:9000 \
                        -Dsonar.login=${SONAR_TOKEN}
                    """
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Deploy to DESA') {
            steps {
                echo "=== Desplegando a entorno de Desarrollo ==="
                sh 'rm -rf /var/www/desa/*'
                sh 'cp -r .next public package.json /var/www/desa/'
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
                sh 'cp -r /var/www/desa/* /var/www/prod/'
                sh 'ls -l /var/www/prod'
            }
        }
    }

    environment {
        SONAR_TOKEN = credentials('SONAR_TOKEN') // Token de SonarQube en Jenkins Credentials
    }
}
