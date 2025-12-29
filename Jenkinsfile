pipeline {
    agent any

    triggers {
        githubPush() // Dispara el pipeline cuando hay push a GitHub
    }

    environment {
        SONAR_TOKEN = credentials('SONAR_TOKEN') // token de SonarQube
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
                    script {
                        // Ejecuta el análisis usando sonar.token
                        sh """
                            npx sonar-scanner \
                                -Dsonar.projectKey=sonarPipeline \
                                -Dsonar.projectName='sonarPipeline' \
                                -Dsonar.sources=. \
                                -Dsonar.host.url=http://172.174.241.22:9000 \
                                -Dsonar.token=$SONAR_TOKEN
                        """
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                script {
                    // Espera la finalización del análisis y obtiene el estado
                    timeout(time: 10, unit: 'MINUTES') {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            error "Pipeline abortado: Quality Gate = ${qg.status}"
                        }
                        echo "Quality Gate passed: ${qg.status}"
                    }
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
}
