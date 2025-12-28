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

        stage('Deploy to DESA') {
            steps {
                echo "Desplegando a entorno de Desarrollo..."
                // Borra la carpeta anterior si existe
                bat 'rmdir /S /Q C:\\JenkinsDeploy\\DEV\\Pokedex || exit 0'
                // Crea la carpeta y copia la build
                bat 'xcopy /E /I .\\out C:\\JenkinsDeploy\\DEV\\Pokedex\\'
            }
        }

        stage('Run Automated Tests') {
            steps {
                echo "Ejecutando tests unitarios..."
                bat 'npm test'
                // E2E eliminado de momento
            }
        }

        stage('Deploy to PROD') {
            steps {
                input message: '¿Deseas desplegar a PRODUCCIÓN?'
                echo "Desplegando a Producción..."
                bat 'rmdir /S /Q C:\\JenkinsDeploy\\PROD\\Pokedex || exit 0'
                bat 'xcopy /E /I .\\out C:\\JenkinsDeploy\\PROD\\Pokedex\\'
            }
        }
    }
}
