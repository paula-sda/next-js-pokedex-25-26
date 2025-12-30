pipeline {
    agent any

    triggers {
        githubPush() 
    }

    environment {
        SONAR_TOKEN = credentials('SONAR_TOKEN') 
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

        stage('Deploy DESA') {
            steps {
                sh '''
set -e
cd /opt/desa

if [ ! -d next-js-pokedex-25-26 ]; then
  git clone https://github.com/paula-sda/next-js-pokedex-25-26.git
else
  cd next-js-pokedex-25-26
  git fetch origin
  git reset --hard origin/main
  cd ..
fi

cd next-js-pokedex-25-26

npm install

echo "Construyendo aplicación"
npm run build

echo "Arrancando aplicación en DESA (puerto 3000)"
pkill -f "next start" || true
nohup npm run start -- -H 0.0.0.0 -p 3000 > desa.log 2>&1 &
'''
            }
        }

        stage('Test DESA') {
            steps {
                sh '''
echo "Esperando a que la aplicación de DESA se inicie..."
for i in {1..20}; do
    curl -s http://172.174.241.22:3000 > /dev/null && break
    echo "Intento $i: la aplicación aún no responde, esperando 3s..."
    sleep 3
done

echo "Verificando que la aplicación responde..."
curl -f http://172.174.241.22:3000
echo "Aplicación de DESA accesible correctamente"
echo "Abre esta URL en tu navegador para ver DESA:"
echo "http://172.174.241.22:3000"
'''
            }
        }

        stage('Approval before PROD') {
            steps {
                input message: 'DESA OK. ¿Deseas pasar a PRODUCCIÓN?'
            }
        }

        stage('Deploy to PROD') {
            steps {
                sh '''
set -e
cd /opt/produccion

if [ ! -d next-js-pokedex-25-26 ]; then
  git clone https://github.com/paula-sda/next-js-pokedex-25-26.git
else
  cd next-js-pokedex-25-26
  git fetch origin
  git reset --hard origin/main
  cd ..
fi

cd next-js-pokedex-25-26

npm install

npm run build

echo "Arrancando aplicación en PRODUCCIÓN (puerto 4000)"
pkill -f "next start" || true
nohup npm run start -- -H 0.0.0.0 -p 4000 > produccion.log 2>&1 &
'''
            }
        }

        stage('Test PROD (smoke)') {
            steps {
                sh '''
echo "Esperando a que la aplicación de PRODUCCIÓN se inicie..."
for i in {1..20}; do
    curl -s http://172.174.241.22:4000 > /dev/null && break
    echo "Intento $i: la aplicación aún no responde, esperando 3s..."
    sleep 3
done

echo "Verificando que la aplicación responde en PRODUCCIÓN (smoke test)..."
curl -f http://172.174.241.22:4000
echo "Aplicación de PRODUCCIÓN accesible correctamente"
echo "Abre esta URL en tu navegador para ver PRODUCCIÓN:"
echo "http://172.174.241.22:4000"
'''
            }
        }
    }

    post {
        success {
            echo "DESPLIEGUE COMPLETADO (DESA + PRODUCCIÓN)"
        }
        failure {
            echo "El pipeline ha fallado. Revisa los logs."
        }
    }
}
