pipeline {
    agent any

    triggers {
        githubPush() // dispara el pipeline cuando hay un push en GitHub
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

        stage('Run Tests') {
            steps {
                bat 'npm test'
            }
        }

        stage('Deploy to Dev') {
            steps {
                bat 'npm run start'
            }
        }

        stage('Deploy to Prod') {
            steps {
                echo 'Deploying to Production...'
                // Aquí podrías poner scripts de despliegue reales
            }
        }
    }
}
